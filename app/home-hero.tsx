"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WORDS: { word: string; pill: string }[] = [
  { word: "chatting", pill: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300" },
  { word: "talking", pill: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
  { word: "vibing", pill: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
  { word: "chilling", pill: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" },
  { word: "hanging", pill: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  { word: "engaging", pill: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  { word: "bonding", pill: "border-violet-400/40 bg-violet-400/10 text-violet-300" },
  { word: "laughing", pill: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  { word: "yapping", pill: "border-lime-400/40 bg-lime-400/10 text-lime-300" },
  { word: "joking", pill: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
];

// Widest word reserves the slot so the sentence never reflows as words swap.
const WIDEST = WORDS.reduce((a, b) => (b.word.length > a.length ? b.word : a), "");

function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const base = "rounded-md border px-2 py-0.5 font-semibold";
  const { word, pill } = WORDS[i];

  return (
    <span className="relative mx-1 inline-grid align-middle">
      {/* Invisible sizer reserves the width of the widest word so the rest of
          the sentence never shifts as words swap. */}
      <span aria-hidden className={`invisible [grid-area:1/1] ${base}`}>
        {WIDEST}
      </span>
      <span
        key={word}
        className={`animate-bv-word-in flex items-center justify-center [grid-area:1/1] ${base} ${pill}`}
      >
        {word}
      </span>
    </span>
  );
}

export function HomeHero() {
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
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-[#070713] lg:min-h-[640px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/herosplash.webp"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      {/* Contrast scrims: an overall darken, a strong left wash where the text
          sits, and a bottom fade so the section blends into the page below. */}
      <div className="absolute inset-0 -z-10 bg-[#070713]/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070713] via-[#070713]/85 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#070713] via-[#070713]/40 to-transparent" />

      <div className="mx-auto w-full max-w-5xl px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-left">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-[52px]">
            24/7 AI Chatbot that works while you sleep
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-200 [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]">
            Easily train your AI Chatbot in minutes
            <br />
            and start <RotatingWord /> with your visitors.
          </p>

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:mx-0">
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
        </div>
      </div>
    </section>
  );
}
