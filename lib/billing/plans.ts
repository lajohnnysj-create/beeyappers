// Single source of truth for plan limits + display copy.
// Client-safe: no secrets, no price IDs (those live in stripe-prices.ts, server).

// Paid, Stripe-backed plans (stored in subscriptions.plan).
export type PlanKey = "basic" | "pro";
// Effective tier an account is on, including the free floor.
export type TierKey = "free" | "basic" | "pro";
export type Interval = "month" | "year";

export type Plan = {
  key: TierKey;
  name: string;
  tagline: string;
  messageCap: number; // AI replies per rolling 30 days, per account
  maxSites: number;
  monthly: number; // $/mo on monthly billing (0 = free)
  annualMonthly: number; // $/mo when billed annually
  model: string; // OpenAI model used to answer on this tier
  features: string[];
};

export const PLANS: Record<TierKey, Plan> = {
  free: {
    key: "free",
    name: "Free",
    tagline: "Try Bleviq on your site, no card needed.",
    messageCap: 75,
    maxSites: 1,
    monthly: 0,
    annualMonthly: 0,
    model: "gpt-4o-mini",
    features: [
      "75 AI replies",
      "Powered by GPT-4o-mini",
      "1 trained site up to 100 pages",
      "Custom branding, colors & fonts",
    ],
  },
  basic: {
    key: "basic",
    name: "Basic",
    tagline: "For small businesses and start-ups.",
    messageCap: 1000,
    maxSites: 1,
    monthly: 20,
    annualMonthly: 12,
    model: "gpt-4.1-mini",
    features: [
      "1,000 AI replies",
      "GPT-4-class intelligence",
      "1 trained site up to 100 pages",
      "Custom branding, colors & fonts",
      "No Bleviq branding",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro",
    tagline: "For busy sites with more traffic.",
    messageCap: 8000,
    maxSites: 1,
    monthly: 40,
    annualMonthly: 30,
    model: "gpt-4.1-mini",
    features: [
      "8,000 AI replies",
      "GPT-4-class intelligence",
      "Everything in Basic",
      "Priority support",
      "No Bleviq branding",
    ],
  },
};

// Paid plans, in checkout order.
export const PLAN_ORDER: PlanKey[] = ["basic", "pro"];
// All tiers, in pricing-display order (free first).
export const TIER_ORDER: TierKey[] = ["free", "basic", "pro"];

// Total charged once per year on annual billing.
export function annualTotal(plan: Plan): number {
  return plan.annualMonthly * 12;
}

export function isPlanKey(v: unknown): v is PlanKey {
  return v === "basic" || v === "pro";
}

// Message cap for a tier. Unknown -> 0 (gating handled by callers).
export function planMessageCap(tier: TierKey | null | undefined): number {
  return tier && PLANS[tier] ? PLANS[tier].messageCap : 0;
}

// Site allowance for a tier. Unknown -> 0.
export function planMaxSites(tier: TierKey | null | undefined): number {
  return tier && PLANS[tier] ? PLANS[tier].maxSites : 0;
}
