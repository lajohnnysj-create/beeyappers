"use client";

import { useEffect, useState } from "react";
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

  // GPC forces opt-out; otherwise opted out whenever analytics is not allowed.
  const optedOut = gpc || !analytics;

  const toggle = () => {
    if (gpc) return; // GPC overrides the on-page setting
    const nextAnalytics = optedOut; // currently opted out -> turn analytics on
    setAnalytics(nextAnalytics);
    writeConsent(nextAnalytics, gpcActive());
    setSaved(true);
  };

  const status = gpc
    ? "Your browser is sending a Global Privacy Control signal, so Google Analytics will not load on this device, regardless of the setting here."
    : optedOut
      ? "You are opted out. Google Analytics will not load on this device."
      : "Analytics may load on this device, subject to your cookie banner consent.";

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <p className="text-base font-semibold text-slate-900">
        Analytics on this device
      </p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600" aria-live="polite">
        {status}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <span className="text-sm font-medium text-slate-900">
          Opt out of analytics on this device
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={optedOut}
          aria-label="Opt out of analytics on this device"
          disabled={gpc}
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            optedOut ? "bg-brand-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              optedOut ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {saved && !gpc && (
        <p className="mt-4 text-sm font-medium text-emerald-700">
          Saved on this device.
        </p>
      )}
    </div>
  );
}
