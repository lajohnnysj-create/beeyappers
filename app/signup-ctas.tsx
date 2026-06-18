"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// The signup CTA pair (Continue with Google + Continue with Email) and the
// "Free 14-day trial" line. Shared by the hero and the bottom CTA so the two
// are always identical. Styled for a dark background.
// `centered` keeps the button column centered on all breakpoints (for the
// centered bottom CTA); the default left-aligns on sm+ to match the hero.
export function SignupCtas({ centered = false }: { centered?: boolean }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    // On success the browser is already navigating to Google.
    if (error) setGoogleLoading(false);
  }

  return (
    <>
      <div
        className={
          "mx-auto mt-8 flex max-w-sm flex-col gap-3" +
          (centered ? "" : " sm:mx-0")
        }
      >
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 disabled:opacity-70"
        >
          <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {googleLoading ? "Redirecting\u2026" : "Continue with Google"}
        </button>

        <Link
          href="/login?email=1&mode=signup"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          Continue with Email
        </Link>
      </div>

      <p className="mt-3 text-sm text-slate-300">
        Free 14-day trial. Cancel anytime.
      </p>
    </>
  );
}
