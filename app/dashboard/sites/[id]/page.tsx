import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mergeConfig } from "@/lib/widget-config";
import { Wordmark } from "@/app/wordmark";
import { Workspace } from "./workspace";

export default async function SiteWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, domain, widget_key, widget_config, crawl_status, last_crawled_at")
    .eq("id", params.id)
    .single();

  if (!site || !user) notFound();

  const [{ count: pageCount }, { count: chunkCount }] = await Promise.all([
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("site_id", site.id),
    supabase.from("chunks").select("*", { count: "exact", head: true }).eq("site_id", site.id),
  ]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard">
            <Wordmark />
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            All sites
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Site
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {site.name}
          </h1>
        </div>

        <Workspace
          siteId={site.id}
          userId={user.id}
          siteName={site.name}
          domain={site.domain}
          widgetKey={site.widget_key}
          crawlStatus={site.crawl_status}
          lastCrawledAt={site.last_crawled_at}
          pageCount={pageCount || 0}
          chunkCount={chunkCount || 0}
          config={mergeConfig(site.widget_config)}
        />
      </main>
    </div>
  );
}
