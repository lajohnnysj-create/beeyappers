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

  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email: email || undefined,
    metadata: { user_id: userId },
  });

  await admin
    .from("subscriptions")
    .upsert(
      { user_id: userId, stripe_customer_id: customer.id },
      { onConflict: "user_id" }
    );

  return customer.id;
}
