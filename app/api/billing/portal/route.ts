import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/billing/stripe";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/security/same-origin";

export const dynamic = "force-dynamic";

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

  const admin = createAdminClient();

  const allowed = await checkRateLimit(
    admin,
    `billing:portal:${user.id}`,
    RL_LIMIT,
    RL_WINDOW
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  const { data } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: portal.url });
}
