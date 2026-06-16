"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/app/wordmark";

/**
 * Single source of truth for the marketing chrome (header + footer).
 * Every public marketing page renders <SiteHeader signedIn={...} /> at the top
 * and <SiteFooter /> at the bottom. Change nav links, the CTA, or footer
 * content here and it updates everywhere at once.
 *
 * The page (a server component) fetches auth and passes `signedIn`, so this
 * file stays purely presentational. It's a client component because the mobile
 * hamburger needs toggle state.
 */

// ---- Header ---------------------------------------------------------------
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const cta = signedIn
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Start free trial" };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Bleviq home" onClick={close}>
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-base font-medium text-slate-600 sm:flex sm:gap-6">
          <Link href="/pricing" className="transition hover:text-slate-900">
            Pricing
          </Link>
          {!signedIn && (
            <Link href="/login" className="transition hover:text-slate-900">
              Sign in
            </Link>
          )}
          <Link
            href={cta.href}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700"
          >
            {cta.label}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 sm:hidden"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav
          id="site-mobile-menu"
          className="border-t border-slate-200/70 bg-white/95 backdrop-blur sm:hidden"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-3 text-sm font-medium text-slate-700">
            <Link
              href="/pricing"
              onClick={close}
              className="rounded-lg px-2 py-2.5 transition hover:bg-slate-100"
            >
              Pricing
            </Link>
            {!signedIn && (
              <Link
                href="/login"
                onClick={close}
                className="rounded-lg px-2 py-2.5 transition hover:bg-slate-100"
              >
                Sign in
              </Link>
            )}
            <Link
              href={cta.href}
              onClick={close}
              className="mt-1 rounded-lg bg-brand-600 px-3 py-2.5 text-center text-white transition hover:bg-brand-700"
            >
              {cta.label}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

// ---- Footer ---------------------------------------------------------------
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Bleviq home">
            <Wordmark />
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
            <Link href="/pricing" className="transition hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/privacy" className="transition hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-slate-900">
              Terms
            </Link>
            <Link href="/ai-terms" className="transition hover:text-slate-900">
              AI Terms
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          © {year} MRLA Media LLC. Bleviq is a product of MRLA Media LLC.
        </p>
      </div>
    </footer>
  );
}
