import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { pageMetadata } from "@/lib/seo";
import { DoNotShareControls } from "./controls";

export const metadata: Metadata = pageMetadata({
  title: "Your Privacy Choices | Bleviq",
  description:
    "Opt out of (or back into) analytics cookies on Bleviq. We do not sell your personal information.",
  path: "/do-not-share",
});

export default async function DoNotSharePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-2xl px-6 py-16 focus:outline-none"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Your Privacy Choices
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
          Bleviq does not sell your personal information. The only optional data
          collection on this site is analytics, which helps us understand how the
          site is used so we can improve it. Some privacy laws treat analytics as
          a form of sharing, so you can opt out, or back in, at any time using the
          control below. Your choice is saved on this device.
        </p>
        <DoNotShareControls />
      </main>
      <SiteFooter />
    </div>
  );
}
