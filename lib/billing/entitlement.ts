import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PlanKey, planMessageCap, planMaxSites } from "./plans";

export type Entitlement = {
  plan: PlanKey | null;
  status: string;
  active: boolean; // entitled to serve answers (trial or paid, in good standing)
  hasBilling: boolean; // has a Stripe customer (can open the billing portal)
  messageCap: number;
  maxSites: number;
};

// A subscription that entitles the account to serve answers.
const ENTITLED = new Set(["active", "trialing"]);

export async function getEntitlementByUserId(
  userId: string
): Promise<Entitlement> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("plan, status, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const status = data?.status ?? "none";
  const plan = (data?.plan as PlanKey | null) ?? null;
  const active = ENTITLED.has(status) && !!plan;

  return {
    plan,
    status,
    active,
    hasBilling: !!data?.stripe_customer_id,
    messageCap: active ? planMessageCap(plan) : 0,
    // One site is allowed even before subscribing so a new user can set up and
    // preview; serving live answers still requires an active plan.
    maxSites: active ? planMaxSites(plan) : 1,
  };
}
