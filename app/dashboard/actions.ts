"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function createSite(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const domain = String(formData.get("domain") || "").trim();

  if (!name) return { error: "Give your site a name." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You are signed out. Refresh and sign in again." };

  // user_id is set explicitly. RLS WITH CHECK confirms it equals auth.uid(),
  // so a mismatched user_id would be rejected by the database.
  const { error } = await supabase.from("sites").insert({
    user_id: user.id,
    name,
    domain: domain || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: "Site created." };
}
