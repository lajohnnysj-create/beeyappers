import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/billing/stripe";
import { getOrCreateCustomer } from "@/lib/billing/customer";
import { priceIdFor } from "@/lib/billing/stripe-prices";
import { isPlanKey } from "@/lib/billing/plans";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/security/same-origin";

export const dynamic = "force-dynamic";

// Per-user throttle so a session can't spin up a pile of Checkout Sessions /
// customers. Generous enough to never hit in normal use.
const RL_LIMIT = 10;
const RL_WINDOW = 60; // seconds

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const ok = await checkRateLimit(
    createAdminClient(),
    `billing:checkout:${user.id}`,
    RL_LIMIT,
    RL_WINDOW
  );
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  let plan: unknown;
  let interval: unknown;
  try {
    const body = await req.json();
    plan = body.plan;
    interval = body.interval;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!isPlanKey(plan) || (interval !== "month" && interval !== "year")) {
    return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
  }

  const price = priceIdFor(plan, interval);
  if (!price) {
    return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const customerId = await getOrCreateCustomer(user.id, user.email ?? null);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { user_id: user.id },
    },
    // Card required even though there's a trial.
    payment_method_collection: "always",
    allow_promotion_codes: true,
    // Express affirmative consent to the renewal terms, recorded by Stripe.
    // NOTE: requires a Terms of Service URL set in the Stripe Dashboard
    // (Settings -> Business -> Public details). Without it, session creation
    // fails. Point it at https://www.bleviq.com/terms.
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message:
          "I agree to the Terms and authorize Bleviq to charge my plan price automatically each billing period after the 14-day free trial, until I cancel. I can cancel anytime in Settings -> Billing.",
      },
      submit: {
        message:
          "After your 14-day free trial, this plan renews automatically at the price above until you cancel. Cancel anytime in Settings -> Billing.",
      },
    },
    client_reference_id: user.id,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
