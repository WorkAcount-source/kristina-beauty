import { Router, raw } from "express";
import type Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { createServiceClient } from "../lib/supabase";

const router = Router();

// express.raw() captures the body as a Buffer — required for Stripe signature verification.
// This router is mounted BEFORE express.json() in index.ts so the stream is still intact.
router.post("/webhook", raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) {
    res.status(400).json({ error: "missing signature" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe webhook] signature verify failed", err);
    res.status(400).json({ error: "invalid signature" });
    return;
  }

  try {
    const admin = createServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin
            .from("orders")
            .update({ status: "paid" })
            .eq("id", orderId)
            .eq("status", "pending");
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId)
            .eq("status", "pending");
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const orderId = (charge.metadata as { order_id?: string } | null)?.order_id;
        if (orderId) {
          await admin.from("orders").update({ status: "refunded" }).eq("id", orderId);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    res.status(500).json({ error: "internal" });
    return;
  }

  res.json({ received: true });
});

export { router as stripeWebhookRouter };
