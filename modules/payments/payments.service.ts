import { stripe } from "@/lib/stripe/client";
import {
  fetchActiveProducts,
  createOrder,
  createOrderItems,
  rollbackOrder,
  updateOrderPaymentIntent,
  setOrderStatus,
  setOrderStatusConditional,
} from "./payments.repository";
import { ValidationError, ConflictError } from "@/lib/utils/errors";
import type { CheckoutInput } from "./payments.schema";
import type Stripe from "stripe";

function dedupeItems(items: { id: string; qty: number }[]) {
  const map = new Map<string, number>();
  for (const it of items) map.set(it.id, (map.get(it.id) ?? 0) + it.qty);
  return Array.from(map.entries()).map(([id, qty]) => ({ id, qty }));
}

export async function createCheckoutSession(
  input: CheckoutInput,
  userId: string
): Promise<{ url?: string | null; orderId: string }> {
  const items = dedupeItems(input.items);
  const ids = items.map((i) => i.id);

  const products = await fetchActiveProducts(ids);
  if (products.length !== ids.length) {
    throw new ValidationError("מוצר לא זמין");
  }

  for (const it of items) {
    const p = products.find((x) => x.id === it.id)!;
    if (typeof p.stock === "number" && p.stock < it.qty) {
      throw new ConflictError(`אזל המלאי עבור: ${p.name}`);
    }
  }

  const lineItems = items.map((i) => {
    const p = products.find((x) => x.id === i.id)!;
    return { product: p, qty: i.qty, total: Number(p.price) * i.qty };
  });
  const total = lineItems.reduce((a, b) => a + b.total, 0);

  const order = await createOrder({
    user_id: userId,
    total,
    customer_name: input.customer.name,
    customer_email: input.customer.email,
    customer_phone: input.customer.phone,
    shipping_address: input.customer.address,
  });

  try {
    await createOrderItems(
      lineItems.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        qty: l.qty,
        unit_price: Number(l.product.price),
      }))
    );
  } catch (err) {
    await rollbackOrder(order.id);
    throw err;
  }

  if (stripe) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "ils",
      customer_email: input.customer.email,
      line_items: lineItems.map((l) => ({
        price_data: {
          currency: "ils",
          product_data: {
            name: l.product.name,
            images: l.product.image_url ? [l.product.image_url] : [],
          },
          unit_amount: Math.round(Number(l.product.price) * 100),
        },
        quantity: l.qty,
      })),
      success_url: `${siteUrl}/account?tab=orders&success=true`,
      cancel_url: `${siteUrl}/cart`,
      client_reference_id: userId,
      metadata: { order_id: order.id, user_id: userId },
    });
    await updateOrderPaymentIntent(order.id, session.id);
    return { url: session.url, orderId: order.id };
  }

  // Mock confirm in development (no Stripe key configured).
  await setOrderStatus(order.id, "paid");
  return { orderId: order.id };
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) await setOrderStatusConditional(orderId, "paid", "pending");
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) await setOrderStatusConditional(orderId, "cancelled", "pending");
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const orderId = (charge.metadata as { order_id?: string } | null)?.order_id;
      if (orderId) await setOrderStatus(orderId, "refunded");
      break;
    }
    // All other events are acknowledged but no-op.
  }
}
