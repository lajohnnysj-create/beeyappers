import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Google (and any future OAuth provider) lands here after Supabase finishes the
// provider handshake. We exchange the one-time code for a session (the PKCE
// verifier is in the cookie set when the flow started) and then redirect into
// the app. `next` is honored only when it's a relative path, to avoid being
// turned into an open redirect.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") || "/dashboard";
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";
  const providerError =
    searchParams.get("error_description") || searchParams.get("error");

  // Resolve the public host. Behind Vercel the request origin can be an
  // internal host, so prefer x-forwarded-host in production (this also keeps us
  // on the www canonical instead of bouncing through a redirect).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  if (providerError) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(providerError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent("Sign-in was cancelled.")}`
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${base}${next}`);
}
