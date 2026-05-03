import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { checkoutSchema } from "./payments.schema";
import { createCheckoutSession, handleStripeEvent } from "./payments.service";
import { requireAuth } from "@/middleware/auth";
import { ok, handleError } from "@/lib/utils/response";
import type Stripe from "stripe";

export async function handleCheckout(req: Request): Promise<NextResponse> {
  try {
    const user = await requireAuth();
    const json = await req.json();
    const parsed = checkoutSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
    }
    const result = await createCheckoutSession(parsed.data, user.id);
    return ok(result);
  } catch (err) {
    return handleError(err, "/api/checkout");
  }
}

export async function handleWebhook(req: Request): Promise<NextResponse> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
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
    await handleStripeEvent(event);
  } catch (err) {
    // Return 500 so Stripe retries on transient failures (DB hiccup, etc.).
    return handleError(err, "stripe webhook");
  }

  return NextResponse.json({ received: true });
}
