"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

// Soft cap. Raise this (or make it per-account) when paid tiers ship.
const MAX_SITES = 1;

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

  // RLS scopes this count to the user's own sites.
  const { count } = await supabase
    .from("sites")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_SITES) {
    return {
      error: "You can have one site right now. Multiple sites are coming with paid plans.",
    };
  }

  const { error } = await supabase.from("sites").insert({
    user_id: user.id,
    name,
    domain: domain || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: "Site created." };
}
