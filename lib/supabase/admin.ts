import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the secret (service_role) key, which bypasses RLS.
// Never import this into a client component. The "server-only" import above
// makes the build fail if that ever happens.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
