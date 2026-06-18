"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FIELD_LIMITS, clampLen } from "@/lib/field-limits";
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
