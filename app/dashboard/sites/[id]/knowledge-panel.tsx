"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type KnowledgeItem = {
  sourceId: string;
  type: string; // "document" | "faq"
  label: string | null;
  count: number;
};

export function KnowledgePanel({
  siteId,
  items,
}: {
  siteId: string;
  items: KnowledgeItem[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "faq">("none");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFaq() {
    if (!question.trim() || !answer.trim()) {
      setError("Add both a question and an answer.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "faq", siteId, question, answer }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Could not add FAQ.");
      else {
        setQuestion("");
        setAnswer("");
        setMode("none");
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadDoc(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("siteId", siteId);
      form.append("file", file);
      const res = await fetch("/api/knowledge", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Upload failed.");
      else router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(sourceId: string) {
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", siteId, sourceId }),
      });
      if (res.ok) router.refresh();
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Knowledge</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add documents or FAQs. These work right away and survive re-training.
          </p>
        </div>
      </div>

      {busy && (
        <p className="mt-3 text-sm text-slate-500">Adding to your knowledge base...</p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {mode === "none" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/50">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M12 11v6m-3-3h6" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">Upload document</span>
              <span className="block text-xs text-slate-500">PDF, DOCX, TXT, or MD</span>
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0])}
            />
          </label>

          <button
            onClick={() => {
              setMode("faq");
              setError(null);
            }}
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
                <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 2.5" />
                <path d="M12 16h.01" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">Add FAQ</span>
              <span className="block text-xs text-slate-500">A question and its answer</span>
            </span>
          </button>
        </div>
      )}

      {mode === "faq" && (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Question</span>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Do you offer refunds?"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Answer</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="Write the answer the assistant should give."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-600"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={addFaq}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              Add FAQ
            </button>
            <button
              onClick={() => {
                setMode("none");
                setError(null);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {items.map((it) => (
            <li key={it.sourceId} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={
                    "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize " +
                    (it.type === "faq"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-sky-50 text-sky-700")
                  }
                >
                  {it.type}
                </span>
                <span className="truncate text-sm text-slate-800">
                  {it.label || "Untitled"}
                </span>
              </div>
              <button
                onClick={() => remove(it.sourceId)}
                className="shrink-0 text-sm font-medium text-slate-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
