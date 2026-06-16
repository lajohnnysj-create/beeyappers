import { createClient } from "@/lib/supabase/server";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { PricingTable } from "./pricing-table";
import { BleviqWidget } from "@/app/bleviq-widget";

export const metadata = {
  title: "Pricing | Bleviq",
  description:
    "Simple plans for an AI chat widget trained on your site. Every plan starts with a 14-day free trial.",
};

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

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Pricing that scales with your traffic
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Train an AI chat widget on your site in minutes. Pick a plan by how
          many replies you need, upgrade or downgrade anytime.
        </p>

        <PricingTable canceled={canceled} />
      </section>

      <SiteFooter />
      <BleviqWidget />
    </div>
  );
}
