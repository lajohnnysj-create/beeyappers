import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";
import { getOrCreateCustomer } from "@/lib/billing/customer";
import { priceIdFor } from "@/lib/billing/stripe-prices";
import { isPlanKey } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
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
    client_reference_id: user.id,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
