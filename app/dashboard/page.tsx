import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Wordmark } from "@/app/wordmark";
import { NewSiteForm } from "./new-site-form";

type Site = {
  id: string;
  name: string;
  domain: string | null;
  crawl_status: string;
};

const STATUS_STYLE: Record<string, string> = {
  ready: "bg-emerald-50 text-emerald-700",
  crawling: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  pending: "bg-slate-100 text-slate-600",
};

function Header({ email }: { email?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Wordmark />
        <div className="flex items-center gap-4">
          {email && (
            <span className="hidden text-sm text-slate-500 sm:inline">{email}</span>
          )}
          <form action={signOut}>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain, crawl_status")
    .order("created_at", { ascending: false });

  const list = (sites ?? []) as Site[];

  // Single-site flow: drop straight into the workspace.
  if (list.length === 1) {
    redirect(`/dashboard/sites/${list[0].id}`);
  }

  // First run: no site yet.
  if (list.length === 0) {
    return (
      <div className="min-h-screen">
        <Header email={user?.email} />
        <main className="mx-auto flex max-w-md flex-col px-4 py-16">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your site
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add your website and Bleviq will train a chat assistant on it.
          </p>
          <div className="mt-6">
            <NewSiteForm />
          </div>
        </main>
      </div>
    );
  }

  // Grandfathered multi-site accounts keep the list.
  return (
    <div className="min-h-screen">
      <Header email={user?.email} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Your sites
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose a site to open its workspace.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {list.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/sites/${site.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{site.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {site.domain || "No domain set"}
                  </p>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize " +
                    (STATUS_STYLE[site.crawl_status] || STATUS_STYLE.pending)
                  }
                >
                  {site.crawl_status}
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                Open workspace
                <span className="transition group-hover:translate-x-0.5">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
