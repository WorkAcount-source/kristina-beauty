import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { Product } from "@/types/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LINE_ITEMS = 50;
const MAX_QTY_PER_ITEM = 99;

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        qty: z.number().int().positive().max(MAX_QTY_PER_ITEM),
      })
    )
    .min(1)
    .max(MAX_LINE_ITEMS),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(5).max(40),
    address: z.object({
      line1: z.string().trim().min(1).max(200),
      city: z.string().trim().min(1).max(120),
      zip: z.string().trim().max(20).optional(),
    }),
    notes: z.string().trim().max(2000).optional(),
  }),
});

/** Aggregate any duplicate item ids from the request into a single line. */
function dedupeItems(items: { id: string; qty: number }[]) {
  const map = new Map<string, number>();
  for (const it of items) {
    map.set(it.id, (map.get(it.id) ?? 0) + it.qty);
  }
  return Array.from(map.entries()).map(([id, qty]) => ({ id, qty }));
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = checkoutSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
    }
    const body = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "יש להתחבר כדי להשלים תשלום" }, { status: 401 });
    }

    const items = dedupeItems(body.items);
    const ids = items.map((i) => i.id);

    // Validate prices server-side (NEVER trust client-supplied prices).
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("active", true);
    if (pErr) throw pErr;

    const productList = (products as Product[]) ?? [];
    if (productList.length !== ids.length) {
      return NextResponse.json({ error: "מוצר לא זמין" }, { status: 400 });
    }

    // Stock check — refuse if any line exceeds available stock.
    for (const it of items) {
      const p = productList.find((x) => x.id === it.id)!;
      if (typeof p.stock === "number" && p.stock < it.qty) {
        return NextResponse.json(
          { error: `אזל המלאי עבור: ${p.name}` },
          { status: 409 }
        );
      }
    }

    const lineItems = items.map((i) => {
      const p = productList.find((x) => x.id === i.id)!;
      return { product: p, qty: i.qty, total: Number(p.price) * i.qty };
    });
    const total = lineItems.reduce((a, b) => a + b.total, 0);

    // Use service client to bypass RLS for order creation (orders insert is
    // RLS-restricted to `auth.uid() = user_id`; we still pin user_id below).
    const admin = await createServiceClient();
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "pending",
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        customer_phone: body.customer.phone,
        shipping_address: body.customer.address,
      })
      .select()
      .single();
    if (oErr) throw oErr;

    const { error: iErr } = await admin.from("order_items").insert(
      lineItems.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        qty: l.qty,
        unit_price: Number(l.product.price),
      }))
    );
    if (iErr) {
      // Roll back the order we just created so we don't leave a phantom row.
      await admin.from("orders").delete().eq("id", order.id);
      throw iErr;
    }

    if (stripe) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "ils",
        customer_email: body.customer.email,
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
        // Bind the Stripe session to the order *and* the authenticated user
        // so the webhook can verify ownership before fulfilling.
        client_reference_id: user.id,
        metadata: { order_id: order.id, user_id: user.id },
      });
      await admin
        .from("orders")
        .update({ payment_intent_id: session.id })
        .eq("id", order.id);
      return NextResponse.json({ url: session.url, orderId: order.id });
    }

    // Mock confirm (no Stripe configured) — useful in development only.
    await admin.from("orders").update({ status: "paid" }).eq("id", order.id);
    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    // Avoid leaking internal error details to the client.
    console.error("[/api/checkout]", err);
    return NextResponse.json({ error: "שגיאה בעיבוד התשלום" }, { status: 500 });
  }
}
