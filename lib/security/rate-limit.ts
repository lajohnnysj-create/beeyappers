import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Returns true if allowed, false if the limit is exceeded.
// Fails open on a DB error so a transient blip does not break the widget,
// while the per-site monthly token cap still bounds total spend.
export async function checkRateLimit(
  admin: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed:", error.message);
    return true;
  }
  return Boolean(data);
}
