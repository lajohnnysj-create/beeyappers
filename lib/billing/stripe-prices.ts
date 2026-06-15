import "server-only";
import type { PlanKey, Interval } from "./plans";

// Maps plan + interval to the Stripe Price ID. Set these in Vercel env after
// creating the prices in Stripe. Kept server-only so price IDs never ship to
// the browser (the client only sends {plan, interval} to the checkout route).
const PRICE_IDS: Record<PlanKey, Record<Interval, string | undefined>> = {
  basic: {
    month: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    year: process.env.STRIPE_PRICE_BASIC_ANNUAL,
  },
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY,
    year: process.env.STRIPE_PRICE_PRO_ANNUAL,
  },
};

// Price ID to charge for a chosen plan + interval (null if env not set yet).
export function priceIdFor(plan: PlanKey, interval: Interval): string | null {
  return PRICE_IDS[plan]?.[interval] || null;
}

// Reverse lookup used by the webhook: resolve an incoming price ID back to a
// plan + interval so we can store the right tier.
export function planFromPriceId(
  priceId: string
): { plan: PlanKey; interval: Interval } | null {
  const plans: PlanKey[] = ["basic", "pro"];
  const intervals: Interval[] = ["month", "year"];
  for (const plan of plans) {
    for (const interval of intervals) {
      if (PRICE_IDS[plan][interval] === priceId) return { plan, interval };
    }
  }
  return null;
}
