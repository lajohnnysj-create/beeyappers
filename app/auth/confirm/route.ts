import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Emailed confirmation links (Confirm signup, and any other token_hash email
// link) land here. We verify the token_hash to establish a session, then
// redirect into the app.
//
// Why this instead of the PKCE `?code=` flow used by /auth/callback: verifyOtp
// does NOT need the code_verifier cookie, so confirmation works even when the
// user opens the email on a different device than the one they signed up on.
// It also lets us choose the destination via `next` (default /dashboard), so a
// newly confirmed user starts onboarding instead of bouncing to the homepage.
//
// `next` is honored only when it's a relative path, to avoid an open redirect.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") || "/dashboard";
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";

  // Resolve the public host. Behind Vercel the request origin can be an
  // internal host, so prefer x-forwarded-host in production (keeps us on the
  // www canonical instead of bouncing through a redirect).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(
        "That confirmation link is invalid or has expired."
      )}`
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${base}${next}`);
}
