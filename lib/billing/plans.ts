// Single source of truth for plan limits + display copy.
// Client-safe: no secrets, no price IDs (those live in stripe-prices.ts, server).

export type PlanKey = "basic" | "pro";
export type Interval = "month" | "year";

export type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  messageCap: number; // AI replies per rolling 30 days, per account
  maxSites: number;
  monthly: number; // $/mo on monthly billing
  annualMonthly: number; // $/mo when billed annually
  features: string[];
};

export const PLANS: Record<PlanKey, Plan> = {
  basic: {
    key: "basic",
    name: "Basic",
    tagline: "For small businesses and start-ups.",
    messageCap: 1000,
    maxSites: 1,
    monthly: 20,
    annualMonthly: 12,
    features: [
      "1,000 AI replies",
      "1 trained site",
      "Custom branding, colors & fonts",
      "No Bleviq branding",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro",
    tagline: "For busy sites with more traffic.",
    messageCap: 8000,
    maxSites: 1, // TODO: confirm whether Pro should allow more than 1 site
    monthly: 40,
    annualMonthly: 30,
    features: [
      "8,000 AI replies",
      "Everything in Basic",
      "Priority support",
    ],
  },
};

export const PLAN_ORDER: PlanKey[] = ["basic", "pro"];

// Total charged once per year on annual billing.
export function annualTotal(plan: Plan): number {
  return plan.annualMonthly * 12;
}

export function isPlanKey(v: unknown): v is PlanKey {
  return v === "basic" || v === "pro";
}

// Message cap for a given plan. No active plan -> 0 (gating handled by callers).
export function planMessageCap(plan: PlanKey | null | undefined): number {
  return plan && PLANS[plan] ? PLANS[plan].messageCap : 0;
}

// Site allowance for a given plan. No active plan -> 0.
export function planMaxSites(plan: PlanKey | null | undefined): number {
  return plan && PLANS[plan] ? PLANS[plan].maxSites : 0;
}
