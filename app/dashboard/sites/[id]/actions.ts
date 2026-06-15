"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WidgetConfig } from "@/lib/widget-config";

export async function saveBranding(siteId: string, config: WidgetConfig) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // RLS confines this update to the owner's own site row.
  const { error } = await supabase
    .from("sites")
    .update({ widget_config: config })
    .eq("id", siteId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: "Saved." };
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
