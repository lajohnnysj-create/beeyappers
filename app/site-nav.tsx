"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Wordmark } from "@/app/wordmark";
import { SkipLink } from "@/app/skip-link";
import { CookieConsent, SiteAnalytics } from "@/app/cookie-consent";
import { USE_CASES } from "@/app/use-cases/use-cases-data";
import { UCIcon } from "@/app/use-cases/icons";

/**
 * Single source of truth for the marketing chrome (header + footer).
 * Every public marketing page renders <SiteHeader signedIn={...} /> at the top
 * and <SiteFooter /> at the bottom.
 *
 * The header is a fixed, centered floating "pill" that hides when the user
 * scrolls down and reappears when they scroll up. The wrapper is transparent
 * and lets clicks pass through; only the pill itself is interactive, so the
 * hero behind it stays usable.
 *
 * Layout: the pill is out of normal flow, so a spacer keeps page content clear
 * of it. The home page passes `overHero` to drop the spacer, letting its hero
 * image fill all the way to the top with the pill floating over it.
 */

// ---- Header ---------------------------------------------------------------
export function SiteHeader({
  signedIn,
  overHero = false,
}: {
  signedIn: boolean;
  overHero?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const [ucOpen, setUcOpen] = useState(false);
  const ucRef = useRef<HTMLDivElement>(null);
  const ucBtnRef = useRef<HTMLButtonElement>(null);

  // Scroll-hide. rAF-throttled; always visible within TOP_ZONE of the top and
  // while the mobile menu is open; small jitters under DELTA are ignored.
  const [hidden, setHidden] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;
    const TOP_ZONE = 80;
    const DELTA = 6;
    const update = () => {
      ticking = false;
      const y = window.scrollY || 0;
      if (y < TOP_ZONE || openRef.current) {
        setHidden(false);
        lastY = y;
        return;
      }
      const diff = y - lastY;
      if (Math.abs(diff) < DELTA) return;
      setHidden(diff > 0);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Use Cases dropdown: close on outside click / Escape.
  useEffect(() => {
    if (!ucOpen) return;
    function onDown(e: MouseEvent) {
      if (ucRef.current && !ucRef.current.contains(e.target as Node)) {
        setUcOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUcOpen(false);
        ucBtnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ucOpen]);

  const cta = signedIn
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Start for free" };

  return (
    <>
      <SkipLink />

      {/* Fixed, centered floating pill. Wrapper is click-through; pill is not. */}
      <div
        className={
          "pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 transition-transform duration-300 motion-reduce:transition-none sm:pt-5 " +
          (hidden ? "-translate-y-[140%]" : "translate-y-0")
        }
      >
        <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-slate-200/80 bg-white/80 py-2 pl-5 pr-3 shadow-[0_8px_30px_rgba(2,6,23,0.12)] backdrop-blur-md sm:gap-6">
          <Link
            href="/"
            aria-label="Bleviq home"
            onClick={close}
            className="flex items-center [&_img]:!h-9 [&_img]:!w-auto"
          >
            <Wordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 sm:flex sm:gap-6">
            <div className="relative" ref={ucRef}>
              <button
                ref={ucBtnRef}
                type="button"
                onClick={() => setUcOpen((o) => !o)}
                aria-expanded={ucOpen}
                aria-haspopup="true"
                aria-controls="use-cases-menu"
                className="inline-flex items-center gap-1 transition hover:text-slate-900"
              >
                Use Cases
                <svg
                  className={"h-4 w-4 transition-transform " + (ucOpen ? "rotate-180" : "")}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {ucOpen && (
                <div
                  id="use-cases-menu"
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-4 w-[26rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {USE_CASES.map((u) => (
                      <Link
                        key={u.slug}
                        href={`/use-cases/${u.slug}`}
                        role="menuitem"
                        onClick={() => setUcOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
                          style={{ backgroundColor: u.accent }}
                          aria-hidden="true"
                        >
                          <UCIcon name={u.icon} className="h-4 w-4" />
                        </span>
                        <span className="truncate">{u.name}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/use-cases"
                    role="menuitem"
                    onClick={() => setUcOpen(false)}
                    className="mt-2 flex items-center justify-center gap-1 border-t border-slate-100 px-3 pt-3 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                  >
                    View all use cases
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
            <Link href="/pricing" className="transition hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/blog" className="transition hover:text-slate-900">
              Blog
            </Link>
            {!signedIn && (
              <Link href="/login" className="transition hover:text-slate-900">
                Sign in
              </Link>
            )}
            <Link
              href={cta.href}
              className="rounded-full bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700"
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
            className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:hidden"
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
      </div>

      {/* Mobile menu panel (floats just under the pill) */}
      {open && (
        <nav
          id="site-mobile-menu"
          className="pointer-events-auto fixed inset-x-4 top-[4.75rem] z-40 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:hidden"
        >
          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <Link
              href="/use-cases"
              onClick={close}
              className="rounded-lg px-2 py-2.5 transition hover:bg-slate-100"
            >
              Use Cases
            </Link>
            <Link
              href="/pricing"
              onClick={close}
              className="rounded-lg px-2 py-2.5 transition hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              onClick={close}
              className="rounded-lg px-2 py-2.5 transition hover:bg-slate-100"
            >
              Blog
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

      {/* Spacer keeps inner-page content clear of the fixed pill. The home page
          passes overHero to skip it so the hero fills to the very top. */}
      {!overHero && <div aria-hidden="true" className="h-20" />}
    </>
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
            <Link href="/blog" className="transition hover:text-slate-900">
              Blog
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
            <Link
              href="/do-not-share"
              className="transition hover:text-slate-900"
            >
              Do Not Sell or Share
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          © {year} MRLA Media LLC. Bleviq is a product of MRLA Media LLC.
        </p>
      </div>
      <CookieConsent />
      <SiteAnalytics />
    </footer>
  );
}
