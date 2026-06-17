"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/**
 * Cookie consent for the marketing site.
 *
 * Essential cookies (auth/session) always run and need no consent. Analytics is
 * OFF by default and only activates once the visitor opts in here. The choice
 * persists in localStorage. California's Global Privacy Control signal is
 * honored as an automatic opt-out (no banner shown, analytics stays off).
 *
 * To turn analytics on later, drop your provider into <SiteAnalytics />, it only
 * renders when consent has been granted, so the gate is already wired.
 */

const STORE_KEY = "bleviq-consent";
const VERSION = 1; // bump to re-prompt everyone after a material policy change

export type Consent = { analytics: boolean; gpc: boolean; ts: number; v: number };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return c && c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean, gpc: boolean): Consent {
  const c: Consent = { analytics, gpc, ts: Date.now(), v: VERSION };
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(c));
  } catch {
    /* storage blocked; consent simply won't persist this session */
  }
  // Let the analytics gate react without a page reload.
  window.dispatchEvent(new CustomEvent<Consent>("bleviq:consent", { detail: c }));
  return c;
}

function gpcActive(): boolean {
  try {
    return (
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true
    );
  } catch {
    return false;
  }
}

/** True only if the visitor has opted in to analytics. Import before loading any analytics. */
export function analyticsAllowed(): boolean {
  const c = readConsent();
  return !!c && c.analytics === true;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (readConsent()) return; // already decided
    if (gpcActive()) {
      // Honor Global Privacy Control as an opt-out; no banner needed.
      writeConsent(false, true);
      return;
    }
    setVisible(true);
  }, []);

  // Reopen from the footer "Your Privacy Choices" link.
  useEffect(() => {
    const open = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setCustomize(true);
      setVisible(true);
    };
    window.addEventListener("bleviq:open-consent", open);
    return () => window.removeEventListener("bleviq:open-consent", open);
  }, []);

  const acceptAll = useCallback(() => {
    writeConsent(true, gpcActive());
    setVisible(false);
  }, []);
  const essentialOnly = useCallback(() => {
    writeConsent(false, gpcActive());
    setVisible(false);
  }, []);
  const savePrefs = useCallback(() => {
    writeConsent(analytics, gpcActive());
    setVisible(false);
  }, [analytics]);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[90] sm:right-auto sm:max-w-md"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">Cookies on Bleviq</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We use essential cookies to keep the site running, like keeping you
          signed in. With your consent we&apos;d also use analytics cookies to
          understand how the site is used and improve it. See our{" "}
          <Link href="/privacy" className="font-medium text-brand-600 underline">
            Privacy Policy
          </Link>
          .
        </p>

        {customize && (
          <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Essential</p>
                <p className="text-xs text-slate-500">
                  Required for the site to work. Always on.
                </p>
              </div>
              <span className="mt-0.5 text-xs font-medium text-slate-400">
                Always on
              </span>
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-3">
              <span>
                <span className="text-sm font-medium text-slate-900">Analytics</span>
                <span className="block text-xs text-slate-500">
                  Helps us understand usage. Off unless you turn it on.
                </span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Accept all
          </button>
          {customize ? (
            <button
              type="button"
              onClick={savePrefs}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Save choices
            </button>
          ) : (
            <button
              type="button"
              onClick={essentialOnly}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Essential only
            </button>
          )}
          {!customize && (
            <button
              type="button"
              onClick={() => setCustomize(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Gated analytics loader. Renders nothing until the visitor has opted in. When
 * you choose a provider, return its script/component here instead of null, e.g.:
 *
 *   import Script from "next/script";
 *   return (
 *     <Script
 *       src="https://plausible.io/js/script.js"
 *       data-domain="bleviq.com"
 *       strategy="afterInteractive"
 *     />
 *   );
 *
 * or Vercel: import { Analytics } from "@vercel/analytics/react"; return <Analytics />;
 *
 * Because it reads consent and listens for changes, nothing loads without opt-in.
 */
export function SiteAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(analyticsAllowed());
    const onConsent = (e: Event) => {
      const c = (e as CustomEvent<Consent>).detail;
      setAllowed(!!c && c.analytics === true);
    };
    window.addEventListener("bleviq:consent", onConsent);
    return () => window.removeEventListener("bleviq:consent", onConsent);
  }, []);

  if (!allowed) return null;

  // No provider wired yet. Drop it in here (see comment above); the gate is live.
  return null;
}
