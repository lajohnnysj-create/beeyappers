"use client";

export type LeadItem = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
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

export function LeadsPanel({ leads }: { leads: LeadItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">Leads</h2>
      <p className="mt-1 text-sm text-slate-600">
        Contact details visitors submit through the chat. Each one is also
        emailed to you.
      </p>

      {leads.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No leads yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            When a visitor shows intent to book or buy, the assistant asks for
            their contact info. Submissions show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {leads.map((l) => (
            <li
              key={l.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-slate-900">
                  {l.name || "Visitor"}
                </span>
                <span
                  className="text-xs text-slate-500"
                  suppressHydrationWarning
                >
                  {fmt(l.created_at)}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                {l.email && (
                  <a
                    href={`mailto:${l.email}`}
                    className="text-brand-700 hover:underline"
                  >
                    {l.email}
                  </a>
                )}
                {l.phone && (
                  <a
                    href={`tel:${l.phone}`}
                    className="text-brand-700 hover:underline"
                  >
                    {l.phone}
                  </a>
                )}
              </div>
              {l.message && (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Asked: </span>
                  {l.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
