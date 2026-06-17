"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

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
const GA_ID = "G-T5TK5W2S1M"; // Google Analytics 4 measurement ID

export type Consent = { analytics: boolean; gpc: boolean; ts: number; v: number };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return c && c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean, gpc: boolean): Consent {
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

export function gpcActive(): boolean {
  try {
    return (
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true
    );
  } catch {
    return false;
  }
}

/** True only if the visitor has opted in to analytics and GPC is not signaling opt-out. */
export function analyticsAllowed(): boolean {
  if (gpcActive()) return false;
  const c = readConsent();
  return !!c && c.analytics === true;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent()) return; // already decided
    if (gpcActive()) {
      // Honor Global Privacy Control as an opt-out; no banner needed.
      writeConsent(false, true);
      return;
    }
    setVisible(true);
  }, []);

  const accept = useCallback(() => {
    writeConsent(true, gpcActive());
    setVisible(false);
  }, []);
  const decline = useCallback(() => {
    writeConsent(false, gpcActive());
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4"
    >
      <div className="pointer-events-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">
          Cookies &amp; your data
        </p>
        <p className="mt-1.5 text-sm leading-snug text-slate-600">
          We use essential cookies to keep you signed in and the service
          running, plus Google Analytics to understand how our tools are used. No
          advertising, no selling your data.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          <Link href="/privacy" className="font-medium text-brand-600 underline">
            Privacy policy
          </Link>
          <span aria-hidden="true"> · </span>
          <Link
            href="/do-not-share"
            className="font-medium text-brand-600 underline"
          >
            Do Not Sell or Share My Personal Information
          </Link>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={decline}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Decline analytics
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Gated analytics loader. Loads Google Analytics 4 only after the visitor opts
 * in, and listens for consent changes so a later opt-out (e.g. from the Do Not
 * Share page) takes effect without a reload. Nothing about GA loads until
 * consent is granted.
 */
export function SiteAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const apply = (ok: boolean) => {
      setAllowed(ok);
      // Official GA opt-out switch. Setting this true stops Google Analytics
      // even if gtag.js already loaded earlier this session, so opting out from
      // the Do Not Share page takes effect without a reload.
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] =
        !ok;
    };
    apply(analyticsAllowed());
    const onConsent = () => apply(analyticsAllowed());
    window.addEventListener("bleviq:consent", onConsent);
    return () => window.removeEventListener("bleviq:consent", onConsent);
  }, []);

  if (!allowed) return null;

  // Google Analytics 4, loaded only after the visitor opts in to analytics.
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
