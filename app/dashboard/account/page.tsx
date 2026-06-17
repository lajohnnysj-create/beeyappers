import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/app/wordmark";
import { SettingsMenu } from "@/app/dashboard/settings-menu";
import { AgentStatus } from "@/app/dashboard/agent-status";
import { getEntitlementByUserId } from "@/lib/billing/entitlement";
import { PLANS } from "@/lib/billing/plans";
import { ResetPasswordForm } from "./reset-password-form";
import { DeleteAccount } from "./delete-account";
import { TranscriptEmailsSetting } from "./transcript-emails-setting";
import { CollectLeadsSetting } from "./collect-leads-setting";

// Authenticated, per-user page: never cache or statically render it.
export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entitlement = await getEntitlementByUserId(user.id);
  const planLabel = entitlement.plan ? PLANS[entitlement.plan].name : null;
  const cap = entitlement.active
    ? entitlement.messageCap
    : PLANS.basic.messageCap;

  const since30 = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const { count: messagesUsed } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("role", "assistant")
    .gte("created_at", since30);

  // Sites the user owns, for the transcript-email toggles (RLS-confined).
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, email_transcripts, collect_leads")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-4">
            <AgentStatus active={entitlement.active} />
            <SettingsMenu
              email={user.email || ""}
              used={messagesUsed || 0}
              cap={cap}
              planLabel={planLabel}
              status={entitlement.status}
              active={entitlement.active}
            />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-8 focus:outline-none">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        <div className="mt-4 mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Account
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Account settings
          </h1>
        </div>

        <div className="space-y-6">
          <TranscriptEmailsSetting sites={sites ?? []} />
          <ResetPasswordForm />
          <DeleteAccount />
        </div>
      </main>
    </div>
  );
}
