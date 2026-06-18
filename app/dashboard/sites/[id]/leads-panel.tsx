"use client";

import { useState } from "react";
import { deleteLead, setLeadAnswered, setLeadNotes } from "./actions";
import { FIELD_LIMITS } from "@/lib/field-limits";

const NOTE_MAX = FIELD_LIMITS.leadNote;

export type LeadItem = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  answered_at: string | null;
  notes: string | null;
};

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function LeadRow({
  lead,
  onRemove,
}: {
  lead: LeadItem;
  onRemove: (id: string) => void;
}) {
  const [answered, setAnswered] = useState(!!lead.answered_at);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savedNotes, setSavedNotes] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const notesDirty = notes !== savedNotes;

  // Returns true when the note is saved (or there was nothing to save).
  async function saveNotes(): Promise<boolean> {
    if (!notesDirty) return true;
    if (savingNotes) return false;
    setSavingNotes(true);
    const res = await setLeadNotes(lead.id, notes);
    setSavingNotes(false);
    if (res?.error) return false; // leave the edit in place so nothing is lost
    const stored = res?.notes ?? notes;
    setNotes(stored);
    setSavedNotes(stored);
    return true;
  }

  function openNote() {
    setNotes(savedNotes); // start from the last saved value
    setEditingNote(true);
  }

  async function doneNote() {
    const ok = await saveNotes();
    if (ok) setEditingNote(false);
  }

  async function toggleAnswered() {
    if (busy) return;
    const next = !answered;
    setAnswered(next); // optimistic
    setBusy(true);
    const res = await setLeadAnswered(lead.id, next);
    setBusy(false);
    if (res?.error) setAnswered(!next); // revert on failure
  }

  async function confirmDelete() {
    if (busy) return;
    setBusy(true);
    const res = await deleteLead(lead.id);
    if (res?.error) {
      setBusy(false);
      setConfirming(false);
      return;
    }
    onRemove(lead.id);
  }

  return (
    <li
      className={`rounded-xl border p-4 transition-colors ${
        answered ? "border-slate-200 bg-slate-50" : "border-slate-200"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0 text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="font-semibold text-slate-900">
            {lead.name || "Visitor"}
          </span>
          {answered && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Answered
            </span>
          )}
        </span>
        <span className="text-xs text-slate-500" suppressHydrationWarning>
          {fmt(lead.created_at)}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-1 text-sm">
        {lead.email && (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <a
              href={`mailto:${lead.email}`}
              className="text-brand-700 hover:underline"
            >
              {lead.email}
            </a>
          </span>
        )}
        {lead.phone && (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-slate-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <a
              href={`tel:${lead.phone}`}
              className="text-brand-700 hover:underline"
            >
              {lead.phone}
            </a>
          </span>
        )}
      </div>

      {lead.message && (
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Asked: </span>
          {lead.message}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm">
        <button
          type="button"
          onClick={toggleAnswered}
          disabled={busy}
          className="font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          {answered ? "Mark unanswered" : "Mark answered"}
        </button>

        <button
          type="button"
          onClick={() => (editingNote ? doneNote() : openNote())}
          aria-expanded={editingNote}
          className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900"
        >
          Note
          {savedNotes.trim() && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600"
              aria-label="has a note"
            />
          )}
        </button>

        {confirming ? (
          <span className="flex items-center gap-2">
            <span className="text-slate-500">Delete?</span>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={busy}
              className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>

      {editingNote && (
        <div className="mt-3">
          <label
            htmlFor={`lead-notes-${lead.id}`}
            className="block text-xs font-medium text-slate-500"
          >
            Notes
          </label>
          <textarea
            id={`lead-notes-${lead.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={NOTE_MAX}
            rows={3}
            autoFocus
            placeholder="Add a private note (only you can see this)"
            className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              {notes.length}/{NOTE_MAX}
            </span>
            <button
              type="button"
              onClick={doneNote}
              disabled={savingNotes}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {savingNotes ? "Saving…" : "Done"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function LeadsPanel({ leads }: { leads: LeadItem[] }) {
  const [items, setItems] = useState(leads);

  function onRemove(id: string) {
    setItems((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <svg
          className="h-5 w-5 shrink-0 text-brand-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Leads
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Contact details visitors submit through the chat. Each one is also
        emailed to you.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No leads yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            When a visitor shows intent to book or buy, the assistant asks for
            their contact info. Submissions show up here.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {items.map((l) => (
              <LeadRow key={l.id} lead={l} onRemove={onRemove} />
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Showing the 50 most recent. Every lead is also emailed to you, so
            nothing is lost when older ones roll off this list.
          </p>
        </>
      )}
    </section>
  );
}
