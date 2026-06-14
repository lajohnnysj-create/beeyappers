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
  const [mode, setMode] = useState<"none" | "faq" | "doc">("none");
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
      else {
        setMode("none");
        router.refresh();
      }
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Knowledge</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add documents or FAQs. These work right away and survive re-training.
          </p>
        </div>
        {mode === "none" && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode("faq")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Add FAQ
            </button>
            <label className="cursor-pointer rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700">
              Upload document
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                disabled={busy}
                onChange={(e) => e.target.files?.[0] && uploadDoc(e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>

      {busy && (
        <p className="mt-3 text-sm text-slate-500">Adding to your knowledge base...</p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

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
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
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
                <span className="shrink-0 text-xs text-slate-400">
                  {it.count} chunk{it.count === 1 ? "" : "s"}
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
