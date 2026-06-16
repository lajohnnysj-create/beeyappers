import { SiteHeader, SiteFooter } from "@/app/site-nav";

export function LegalShell({
  signedIn,
  title,
  updated,
  children,
}: {
  signedIn: boolean;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={signedIn} />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
        <div className="mt-10 text-[15px] leading-relaxed text-slate-700 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_a]:text-brand-600 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-slate-900">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
