import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Wordmark } from "@/app/wordmark";
import { NewSiteForm } from "./new-site-form";
import { CrawlButton } from "./crawl-button";

type Site = {
  id: string;
  name: string;
  domain: string | null;
  widget_key: string;
  crawl_status: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS scopes this to the signed-in user. No user_id filter needed here,
  // and even if another user's id were guessed, the policy would hide it.
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, domain, widget_key, crawl_status, created_at")
    .order("created_at", { ascending: false });

  const list = (sites ?? []) as Site[];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Wordmark />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user?.email}
            </span>
            <form action={signOut}>
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Your sites
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Each site gets a chat widget trained on its pages.
        </p>

        <div className="mt-6">
          <NewSiteForm />
        </div>

        <div className="mt-6 space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                No sites yet. Add your first one above to get started.
              </p>
            </div>
          ) : (
            list.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <p className="font-medium text-slate-900">{site.name}</p>
                  <p className="text-sm text-slate-600">
                    {site.domain || "No domain set"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {site.widget_key}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    {site.crawl_status}
                  </span>
                  <CrawlButton siteId={site.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
