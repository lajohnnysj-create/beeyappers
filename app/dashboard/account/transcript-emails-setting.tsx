"use client";

import { useState } from "react";
import { setTranscriptEmails } from "@/app/dashboard/sites/[id]/actions";

type Site = { id: string; name: string; email_transcripts: boolean };

function SiteToggleRow({ site }: { site: Site }) {
  const [on, setOn] = useState(site.email_transcripts);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !on;
    setOn(next); // optimistic
    setBusy(true);
    const res = await setTranscriptEmails(site.id, next);
    setBusy(false);
    if (res?.error) setOn(!next); // revert on failure
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
      <span className="truncate text-sm font-medium text-slate-700">
        {site.name}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`Email transcripts for ${site.name}`}
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
  );
}

export function TranscriptEmailsSetting({ sites }: { sites: Site[] }) {
  if (!sites.length) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">
        Email me chat transcripts
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        When a chat goes quiet for 30 minutes, we email you the full
        conversation.
      </p>
      <div className="mt-4 space-y-2">
        {sites.map((s) => (
          <SiteToggleRow key={s.id} site={s} />
        ))}
      </div>
    </section>
  );
}
