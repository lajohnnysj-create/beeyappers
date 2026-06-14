import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mergeConfig } from "@/lib/widget-config";
import { Wordmark } from "@/app/wordmark";
import { BrandingForm } from "./branding-form";

export default async function CustomizePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS scopes this to the owner; a missing row means not yours / not found.
  const { data: site } = await supabase
    .from("sites")
    .select("id, name, widget_key, widget_config")
    .eq("id", params.id)
    .single();

  if (!site || !user) notFound();

  const config = mergeConfig(site.widget_config);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Wordmark />
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Customize {site.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Brand the chat widget. Changes preview live, then save.
        </p>

        <BrandingForm
          siteId={site.id}
          userId={user.id}
          initialConfig={config}
        />
      </main>
    </div>
  );
}
