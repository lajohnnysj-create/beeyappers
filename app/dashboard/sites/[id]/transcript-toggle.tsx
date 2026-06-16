"use client";

import { useState } from "react";
import { setTranscriptEmails } from "./actions";

export function TranscriptToggle({
  siteId,
  initial,
}: {
  siteId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !on;
    setOn(next); // optimistic
    setBusy(true);
    const res = await setTranscriptEmails(siteId, next);
    setBusy(false);
    if (res?.error) setOn(!next); // revert on failure
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Email me chat transcripts
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            When a chat goes quiet for 30 minutes, we email you the full
            conversation.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Email me chat transcripts"
          onClick={toggle}
          disabled={busy}
          className={
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 " +
            (on ? "bg-brand-600" : "bg-slate-300")
          }
        >
          <span
            className={
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition " +
              (on ? "translate-x-5" : "translate-x-1")
            }
          />
        </button>
      </div>
    </section>
  );
}
