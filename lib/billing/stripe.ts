import "server-only";
import Stripe from "stripe";

// Lazy singleton so a missing key fails at request time (with a clear error),
// not at build/import time. Server-only: never import into a client component.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");
  _stripe = new Stripe(secret);
  return _stripe;
}
