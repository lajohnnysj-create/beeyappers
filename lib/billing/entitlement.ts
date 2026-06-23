import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PlanKey, type TierKey, PLANS } from "./plans";
import { MAX_PAGES } from "@/lib/crawl/limits";

export type Entitlement = {
  tier: TierKey; // effective tier: free (the floor), basic, or pro
  paidPlan: PlanKey | null; // the paid plan from billing, null on free
  status: string;
  active: boolean; // the widget serves answers (true on the free floor)
  paid: boolean; // on a paid plan in good standing (unlocks paid perks)
  canRemoveBranding: boolean; // paid perk: hide the "Powered by Bleviq" badge
  hasBilling: boolean; // has a Stripe customer (can open the billing portal)
  messageCap: number;
  messageCapOverridden: boolean; // true when an admin override is in effect
  maxSites: number;
  model: string; // OpenAI model used to answer on this tier
  pageCap: number; // crawl page limit (default, or a per-account override)
  pageCapOverridden: boolean; // true when an admin page-cap override is in effect
};

// Subscription statuses that keep a paid plan's perks active.
const ENTITLED = new Set(["active", "trialing"]);

export async function getEntitlementByUserId(
  userId: string
): Promise<Entitlement> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("plan, status, stripe_customer_id, message_cap_override, page_cap_override")
    .eq("user_id", userId)
    .maybeSingle();

  const status = data?.status ?? "none";
  const paidPlan = (data?.plan as PlanKey | null) ?? null;

  // A paid plan in good standing unlocks paid perks. Anything else (no row,
  // canceled, lapsed) falls to the free floor, which still serves answers.
  const paid = ENTITLED.has(status) && !!paidPlan;
  const tier: TierKey = paid ? (paidPlan as TierKey) : "free";

  // A per-account override (set by an admin for customers who negotiate a
  // larger allowance) wins over the tier default. NULL = no override.
  const override =
    typeof data?.message_cap_override === "number"
      ? data.message_cap_override
      : null;
  const pageOverride =
    typeof data?.page_cap_override === "number"
      ? data.page_cap_override
      : null;

  return {
    tier,
    paidPlan,
    status,
    // Free is the floor: every account serves answers. Gating is by message
    // cap, not by plan status. (A future suspended state could set this false.)
    active: true,
    paid,
    canRemoveBranding: paid,
    hasBilling: !!data?.stripe_customer_id,
    messageCap: override ?? PLANS[tier].messageCap,
    messageCapOverridden: override !== null,
    maxSites: PLANS[tier].maxSites,
    model: PLANS[tier].model,
    pageCap: pageOverride ?? MAX_PAGES,
    pageCapOverridden: pageOverride !== null,
  };
}
