"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
