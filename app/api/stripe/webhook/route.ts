import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFromPriceId } from "@/lib/billing/stripe-prices";

// Stripe SDK needs the Node runtime, and we need the raw body for signature
// verification (so no caching / parsing).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    // Bad signature, or body was altered. Do not process.
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(
          event.data.object as Stripe.Subscription,
          event.created
        );
        break;
      default:
        // Other events are acknowledged but ignored.
        break;
    }
  } catch {
    // Return 500 so Stripe retries the delivery.
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(sub: Stripe.Subscription, eventCreated: number) {
  const admin = createAdminClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Resolve the user: prefer the metadata we set at checkout, else the
  // customer mapping we stored when the customer was created.
  let userId: string | null =
    (sub.metadata && sub.metadata.user_id) || null;
  if (!userId) {
    const { data } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) return; // Can't map to a user; nothing to do.

  // Ordering guard: Stripe does not guarantee delivery order, and retries can
  // land a stale event after a newer one. Never let an older event overwrite
  // newer state (e.g. a late "updated:active" resurrecting a "deleted:canceled"
  // account). Apply only if this event is at least as new as the last applied.
  // Note: event.created is second-resolution, so two events in the same second
  // can still apply in arbitrary order. That is inherent (Stripe exposes no
  // finer sequence) and low-impact; this guards the realistic case of a retry
  // arriving much later.
  const { data: current } = await admin
    .from("subscriptions")
    .select("last_event_ts")
    .eq("user_id", userId)
    .maybeSingle();
  if (current?.last_event_ts != null && eventCreated < current.last_event_ts) {
    return; // stale, out-of-order delivery
  }

  const priceId = sub.items.data[0]?.price.id;
  const mapped = priceId ? planFromPriceId(priceId) : null;

  // A live status with no mapped plan means this price isn't in our price map
  // for the current Stripe mode (a config error). Log loudly: the entitlement
  // layer reads "active but no plan" as free, so a paying customer would be
  // silently under-served. We still record the status so the row isn't stale.
  if (!mapped && (sub.status === "active" || sub.status === "trialing")) {
    console.error(
      `[stripe-webhook] subscription ${sub.id} is "${sub.status}" but price ` +
        `${priceId ?? "(none)"} maps to no plan; customer ${customerId} will ` +
        `read as free until the price map is corrected.`
    );
  }

  // current_period_end moved from the subscription onto its items in recent
  // Stripe API versions. Read whichever is present so a version bump can't
  // silently null this out.
  const periodEndUnix =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (sub.items.data[0] as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end ??
    null;
  const periodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : null;

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan: mapped?.plan ?? null,
      billing_interval: mapped?.interval ?? null,
      status: sub.status,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      last_event_ts: eventCreated,
    },
    { onConflict: "user_id" }
  );
  // Throw on write failure so the route returns 500 and Stripe retries. A
  // swallowed error here would lose billing state permanently: the customer
  // paid, Stripe has the subscription, and the app would still read them as free.
  if (error) {
    throw new Error(`subscriptions upsert failed: ${error.message}`);
  }
}
