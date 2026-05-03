import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { createServiceClient, createUserClient } from "../lib/supabase";
import { stripe } from "../lib/stripe";
import type { Product } from "../types/db";

const router = Router();

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

function dedupeItems(items: { id: string; qty: number }[]) {
  const map = new Map<string, number>();
  for (const it of items) {
    map.set(it.id, (map.get(it.id) ?? 0) + it.qty);
  }
  return Array.from(map.entries()).map(([id, qty]) => ({ id, qty }));
}

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "נתונים לא תקינים" });
      return;
    }
    const body = parsed.data;
    const token = req.headers.authorization!.slice(7);

    const items = dedupeItems(body.items);
    const ids = items.map((i) => i.id);

    // Use user-scoped client so RLS applies to product reads
    const userClient = createUserClient(token);
    const { data: products, error: pErr } = await userClient
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("active", true);
    if (pErr) throw pErr;

    const productList = (products as Product[]) ?? [];
    if (productList.length !== ids.length) {
      res.status(400).json({ error: "מוצר לא זמין" });
      return;
    }

    for (const it of items) {
      const p = productList.find((x) => x.id === it.id)!;
      if (typeof p.stock === "number" && p.stock < it.qty) {
        res.status(409).json({ error: `אזל המלאי עבור: ${p.name}` });
        return;
      }
    }

    const lineItems = items.map((i) => {
      const p = productList.find((x) => x.id === i.id)!;
      return { product: p, qty: i.qty, total: Number(p.price) * i.qty };
    });
    const total = lineItems.reduce((a, b) => a + b.total, 0);

    const admin = createServiceClient();
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        user_id: req.user!.id,
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
      await admin.from("orders").delete().eq("id", order.id);
      throw iErr;
    }

    if (stripe) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
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
        success_url: `${clientUrl}/account?tab=orders&success=true`,
        cancel_url: `${clientUrl}/cart`,
        client_reference_id: req.user!.id,
        metadata: { order_id: order.id, user_id: req.user!.id },
      });

      await admin
        .from("orders")
        .update({ payment_intent_id: session.id })
        .eq("id", order.id);

      res.json({ url: session.url, orderId: order.id });
      return;
    }

    // Mock confirm — Stripe not configured (dev mode)
    await admin.from("orders").update({ status: "paid" }).eq("id", order.id);
    res.json({ orderId: order.id });
  } catch (err) {
    console.error("[POST /api/checkout]", err);
    res.status(500).json({ error: "שגיאה בעיבוד התשלום" });
  }
});

export { router as checkoutRouter };
