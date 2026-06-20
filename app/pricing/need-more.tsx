"use client";

import { useState } from "react";

// A small disclosure under the pricing table: "Need more?" with a chevron that
// rotates from pointing right to pointing down when the sales note is revealed.
export function NeedMore() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto mt-10 max-w-md text-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="need-more-card"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        Need more?
        <svg
          className={"h-4 w-4 transition-transform " + (open ? "rotate-90" : "")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
      {open && (
        <div
          id="need-more-card"
          className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-card"
        >
          Please reach out to our sales team if you need more at{" "}
          <a
            href="mailto:johnnyla@mrla-media.com"
            className="font-semibold text-brand-600 transition hover:text-brand-700"
          >
            johnnyla@mrla-media.com
          </a>
          .
        </div>
      )}
    </div>
  );
}
