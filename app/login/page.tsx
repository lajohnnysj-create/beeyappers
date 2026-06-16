"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, signUp } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/app/wordmark";
import type { ActionState } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Working..." : label}
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction] = useFormState<ActionState, FormData>(action, null);

  const [showEmail, setShowEmail] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Forgot-password flow (handled client-side, like Google sign-in).
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ ok?: string; error?: string } | null>(
    null
  );

  async function handleReset() {
    const email = resetEmail.trim();
    if (!email) return;
    setResetBusy(true);
    setResetMsg(null);
    const supabase = createClient();
    // The recovery email template links to /auth/confirm, so no redirectTo is
    // needed here. Always show a generic success message so the form can't be
    // used to probe which emails have accounts.
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setResetBusy(false);
    if (error) {
      setResetMsg({ error: error.message });
      return;
    }
    setResetMsg({
      ok: "If an account exists for that email, a reset link is on its way. Check your inbox.",
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setOauthError(err);
    if (params.get("deleted"))
      setNotice("Your account has been deleted. We're sorry to see you go.");
    // The homepage "Continue with Email" button links here with these params
    // to open the form directly in account-creation mode.
    if (params.get("email")) setShowEmail(true);
    if (params.get("mode") === "signup") setMode("signup");
  }, []);

  async function handleGoogle() {
    setGoogleLoading(true);
    setOauthError(null);
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    // On success the browser is already navigating to Google; only a setup
    // error returns here.
    if (error) {
      setOauthError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Brand panel: full-height on desktop, top banner on mobile */}
      <div className="h-32 w-full shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 sm:h-40 lg:h-auto lg:w-1/3" />

      {/* Form: app-style sheet on mobile (rounded, pulled up over the image) */}
      <div className="relative z-10 -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-6 pb-10 pt-9 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:mt-0 lg:rounded-none lg:px-12 lg:py-0 lg:shadow-none">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col lg:justify-center lg:py-12">
          <Link
            href="/"
            aria-label="Bleviq home"
            className="mx-auto block w-fit"
          >
            <Wordmark />
          </Link>

          <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px]">
            24/7 AI Chatbox that works while you sleep.
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to train and manage your assistant.
          </p>

          {notice && (
            <p
              role="status"
              className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800"
            >
              {notice}
            </p>
          )}

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          {oauthError && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {oauthError}
            </p>
          )}

          {/* Reveals the email/password fields */}
          <button
            type="button"
            onClick={() => setShowEmail((v) => !v)}
            aria-expanded={showEmail}
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Sign in or sign up with email ID
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${showEmail ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showEmail && !resetMode && (
            <form action={formAction} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-600"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setResetMsg(null);
                        setResetEmail("");
                      }}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-600"
                />
              </div>

              {state?.error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {state.error}
                </p>
              )}
              {state?.ok && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
                  {state.ok}
                </p>
              )}

              <SubmitButton label={mode === "signin" ? "Sign in" : "Sign up"} />

              <p className="text-center text-sm text-slate-600">
                {mode === "signin"
                  ? "No account yet?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  {mode === "signin" ? "Create one" : "Sign in"}
                </button>
              </p>
            </form>
          )}

          {showEmail && resetMode && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-600">
                Enter your email and we&apos;ll send a link to reset your
                password.
              </p>
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand-600"
                />
              </div>

              {resetMsg?.error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {resetMsg.error}
                </p>
              )}
              {resetMsg?.ok && (
                <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {resetMsg.ok}
                </p>
              )}

              <button
                type="button"
                onClick={handleReset}
                disabled={resetBusy || !resetEmail.trim()}
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {resetBusy ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-center text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetMsg(null);
                  }}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Back to sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
