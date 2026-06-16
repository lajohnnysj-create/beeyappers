import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PlanKey, planMessageCap, planMaxSites } from "./plans";

export type Entitlement = {
  plan: PlanKey | null;
  status: string;
  active: boolean; // entitled to serve answers (trial or paid, in good standing)
  hasBilling: boolean; // has a Stripe customer (can open the billing portal)
  messageCap: number;
  messageCapOverridden: boolean; // true when an admin override is in effect
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
    .select("plan, status, stripe_customer_id, message_cap_override")
    .eq("user_id", userId)
    .maybeSingle();

  const status = data?.status ?? "none";
  const plan = (data?.plan as PlanKey | null) ?? null;
  const active = ENTITLED.has(status) && !!plan;

  // A per-account override (set by an admin for customers who negotiate a
  // larger allowance) wins over the plan default whenever the account is
  // active. NULL = no override = use the plan's cap.
  const override =
    typeof data?.message_cap_override === "number"
      ? data.message_cap_override
      : null;

  return {
    plan,
    status,
    active,
    hasBilling: !!data?.stripe_customer_id,
    messageCap: active ? override ?? planMessageCap(plan) : 0,
    messageCapOverridden: active && override !== null,
    // One site is allowed even before subscribing so a new user can set up and
    // preview; serving live answers still requires an active plan.
    maxSites: active ? planMaxSites(plan) : 1,
  };
}
