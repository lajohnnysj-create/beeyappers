import { createClient } from "@/lib/supabase/server";
import { getEntitlementByUserId } from "@/lib/billing/entitlement";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { PricingTable } from "./pricing-table";
import { NeedMore } from "./need-more";
import { BleviqWidget } from "@/app/bleviq-widget";

export const metadata = pageMetadata({
  title: "AI Chatbot for Websites: Pricing and Plans | Bleviq",
  description:
    "Compare Bleviq pricing for an AI chatbot you train on your website to answer visitor questions 24/7. Start free, no credit card required.",
  path: "/pricing",
});

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const canceled = searchParams.checkout === "cancel";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entitlement = user ? await getEntitlementByUserId(user.id) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Pricing that scales with your traffic
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Train an AI chat widget on your site in minutes. Pick a plan by how
          many replies you need, upgrade or downgrade anytime.
        </p>

        <PricingTable
          canceled={canceled}
          currentTier={entitlement?.tier ?? null}
          paid={entitlement?.paid ?? false}
        />
        <NeedMore />
      </section>
      </main>

      <SiteFooter />
      <BleviqWidget />
    </div>
  );
}
