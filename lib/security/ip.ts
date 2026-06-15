import "server-only";
import { createHash } from "crypto";

// Best-effort client IP. Prefer x-real-ip (set by the Vercel edge to the true
// client IP) over x-forwarded-for, whose leftmost entry a client can forge by
// sending its own header. The per-account message cap is the real spend
// backstop; this just makes the per-IP limits harder to slip past.
export function getClientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "0.0.0.0";
}

// One-way hash so we never store raw visitor IPs.
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
