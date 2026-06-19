"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FIELD_LIMITS, clampLen } from "@/lib/field-limits";
import type { Analytics, Bucket } from "@/lib/analytics/types";
import type { WidgetConfig } from "@/lib/widget-config";

export async function saveBranding(siteId: string, config: WidgetConfig) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // Confirm ownership first. RLS already confines the write to the owner's row;
  // this returns a clear error instead of a silent no-op if the site isn't
  // the caller's.
  const { data: owned } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .single();
  if (!owned) return { error: "Site not found." };

  // RLS confines this update to the owner's own site row.
  const { error } = await supabase
    .from("sites")
    .update({ widget_config: config })
    .eq("id", siteId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: "Saved." };
}

export async function setTranscriptEmails(siteId: string, enabled: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // RLS confines this update to the owner's own site row.
  const { error } = await supabase
    .from("sites")
    .update({ email_transcripts: enabled })
    .eq("id", siteId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: true };
}

export async function setCollectLeads(siteId: string, enabled: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // RLS confines this update to the owner's own site row.
  const { error } = await supabase
    .from("sites")
    .update({ collect_leads: enabled })
    .eq("id", siteId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: true };
}

export async function deleteLead(leadId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // RLS confines this delete to the caller's own leads.
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function setLeadAnswered(leadId: string, answered: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // RLS confines this update to the caller's own leads.
  const { error } = await supabase
    .from("leads")
    .update({ answered_at: answered ? new Date().toISOString() : null })
    .eq("id", leadId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function setLeadNotes(leadId: string, notes: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // Clamp server-side; the textarea maxLength is trivially bypassed.
  const clean = clampLen(notes, FIELD_LIMITS.leadNote);
  // RLS confines this update to the caller's own leads.
  const { error } = await supabase
    .from("leads")
    .update({ notes: clean })
    .eq("id", leadId);
  if (error) return { error: error.message };
  return { ok: true, notes: clean };
}

// Best-effort 60s cache, keyed by user+site+range (minute-rounded). Module-level
// so it survives across requests on a warm serverless instance.
const analyticsCache = new Map<string, { at: number; data: Analytics }>();

const EMPTY_ANALYTICS: Analytics = {
  messages_total: 0,
  conversations_total: 0,
  leads_total: 0,
  unique_visitors: 0,
  msg_series: [],
  conv_series: [],
  countries: [],
  cities: [],
  devices: [],
  browsers: [],
  hours: [],
};

export async function getAnalytics(
  siteId: string,
  fromIso: string,
  toIso: string,
  bucket: string,
  tz: string
): Promise<{ data?: Analytics; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  const trunc: Bucket = bucket === "hour" || bucket === "week" ? bucket : "day";
  const zone =
    typeof tz === "string" && tz.length > 0 && tz.length < 64 ? tz : "UTC";
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) {
    return { error: "Invalid date range." };
  }

  const key = `${user.id}:${siteId}:${trunc}:${zone}:${Math.round(
    from.getTime() / 60000
  )}:${Math.round(to.getTime() / 60000)}`;
  const hit = analyticsCache.get(key);
  if (hit && Date.now() - hit.at < 60_000) return { data: hit.data };

  // RLS confines the RPC to the caller's own rows; passing a foreign site id
  // simply yields zeros.
  const { data, error } = await supabase.rpc("analytics_overview", {
    p_site_id: siteId,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
    p_trunc: trunc,
    p_tz: zone,
  });
  if (error) return { error: error.message };

  const payload = (data ?? EMPTY_ANALYTICS) as Analytics;
  analyticsCache.set(key, { at: Date.now(), data: payload });
  return { data: payload };
}

export async function deleteSite(siteId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // Ownership check (RLS returns the row only if the user owns it).
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .single();
  if (!site) return { error: "Site not found." };

  const admin = createAdminClient();

  // Remove this site's uploaded branding assets (storage is not cascaded).
  try {
    const prefix = `${user.id}/${siteId}`;
    const { data: files } = await admin.storage.from("widget-assets").list(prefix);
    if (files && files.length) {
      await admin.storage
        .from("widget-assets")
        .remove(files.map((f) => `${prefix}/${f.name}`));
    }
  } catch {
    // Non-fatal: proceed with row deletion even if storage cleanup fails.
  }

  // Deleting the site cascades pages, chunks, conversations, and messages.
  const { error } = await admin.from("sites").delete().eq("id", siteId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: "deleted" };
}
