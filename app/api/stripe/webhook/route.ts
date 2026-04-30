import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook handler.
 *
 * Security notes:
 * - We require `STRIPE_WEBHOOK_SECRET` and reject the request without it.
 * - Signature is verified via `stripe.webhooks.constructEvent` against the
 *   raw request body (Next 15 `req.text()` returns the raw body string).
 * - We never echo error details back to the caller.
 * - Idempotency: order updates are no-ops if the status is already final.
 */
export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    // Don't 200-OK silently — Stripe will retry, but we want loud failure
    // in observability.
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] signature verify failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    const admin = await createServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          // Only flip pending → paid; never overwrite a refund/cancel.
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
        // Acknowledged but no-op.
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    // Returning 500 makes Stripe retry, which is the correct behavior for
    // transient failures (e.g. database hiccup).
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
