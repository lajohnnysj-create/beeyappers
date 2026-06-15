import "server-only";
import type { NextRequest } from "next/server";

// Belt-and-suspenders CSRF guard for authenticated POST routes. Supabase's
// SameSite session cookie is the primary defense against cross-site POSTs;
// this additionally rejects any request whose Origin header doesn't match the
// host it's hitting. Requests with no Origin header (non-browser clients) pass
// through, since the session cookie still gates them.
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // nothing to contradict; cookie remains the gate
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
