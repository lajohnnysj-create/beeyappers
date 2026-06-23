import "server-only";
import { getStripe } from "./stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Returns the user's Stripe customer ID, creating one (and seeding the
// subscriptions row) on first use. Uses the admin client because it writes
// across RLS; the row is otherwise only writable by the webhook.
export async function getOrCreateCustomer(
  userId: string,
  email: string | null
): Promise<string> {
  const admin = createAdminClient();
  const stripe = getStripe();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  // Reuse the stored customer only if it still exists in the current Stripe
  // mode. It can be gone (deleted during testing, removed by account deletion)
  // or belong to the other mode (a live customer is invisible to test keys and
  // vice versa). In any of those cases we fall through and mint a fresh one so
  // checkout never hard-fails on a dangling reference.
  if (existing?.stripe_customer_id) {
    try {
      const c = await stripe.customers.retrieve(existing.stripe_customer_id);
      if (!(c as { deleted?: boolean }).deleted) {
        return existing.stripe_customer_id;
      }
    } catch {
      // resource_missing (or wrong-mode) — recreate below.
    }
  }

  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: { user_id: userId },
  });

  // Persist the id, and FAIL LOUDLY if the write does not land. A swallowed
  // write here means every checkout mints a fresh customer (the back-button
  // "new checkout, blank form" bug). Insert and update are split on purpose:
  // a new row sets status explicitly so it can't be blocked by a missing DB
  // default, while an existing row's real status is never overwritten.
  const result = existing
    ? await admin
        .from("subscriptions")
        .update({ stripe_customer_id: customer.id })
        .eq("user_id", userId)
    : await admin.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: customer.id,
        status: "none",
      });

  if (result.error) {
    throw new Error(`Could not save Stripe customer: ${result.error.message}`);
  }

  return customer.id;
}
