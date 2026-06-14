import { createClient } from "@supabase/supabase-js";

// Anon client with no session. Subject to RLS as the anon role, so it can only
// read what anon is granted (the public_widget_config view).
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
