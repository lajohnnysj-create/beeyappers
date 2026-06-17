"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent, gpcActive } from "@/app/cookie-consent";

export function DoNotShareControls() {
  const [analytics, setAnalytics] = useState(false);
  const [gpc, setGpc] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setAnalytics(c?.analytics ?? false);
    setGpc(gpcActive());
  }, []);

  const update = (next: boolean) => {
    setAnalytics(next);
    writeConsent(next, gpcActive());
    setSaved(true);
  };

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      {gpc && (
        <div className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your browser is sending a Global Privacy Control signal, so analytics
          is turned off automatically. You can still change the setting below for
          this site.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-900">
            Analytics cookies
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Helps us understand how the site is used. Turn this off to opt out of
            analytics on this device.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={analytics}
          aria-label="Analytics cookies"
          onClick={() => update(!analytics)}
          className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
            analytics ? "bg-brand-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              analytics ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <p className="mt-5 text-sm font-medium" aria-live="polite">
        {saved ? (
          <span className="text-emerald-700">
            Saved. Analytics is now {analytics ? "on" : "off"} on this device.
          </span>
        ) : (
          <span className="text-slate-500">
            Analytics is currently {analytics ? "on" : "off"} on this device.
          </span>
        )}
      </p>

      <p className="mt-6 text-sm text-slate-500">
        See our{" "}
        <Link href="/privacy" className="font-medium text-brand-600 underline">
          Privacy Policy
        </Link>{" "}
        for details on what we collect.
      </p>
    </div>
  );
}
