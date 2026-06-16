"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { siteUrlError } from "@/lib/validate-url";

// Soft cap. Raise this (or make it per-account) when paid tiers ship.
const MAX_SITES = 1;

// Turn a URL or bare domain into a friendly default name (rename-able later).
function deriveName(input: string): string {
  let host = input;
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : "https://" + input);
    host = u.hostname;
  } catch {
    host = input;
  }
  return host.replace(/^www\./i, "") || input;
}

export async function createSite(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const domain = String(formData.get("domain") || "").trim().slice(0, FIELD_LIMITS.domain);
  const providedName = String(formData.get("name") || "").trim().slice(0, FIELD_LIMITS.siteName);

  if (!domain) return { error: "Add your website link to get started." };

  const urlErr = siteUrlError(domain);
  if (urlErr) return { error: urlErr };

  const name = (providedName || deriveName(domain)).slice(0, FIELD_LIMITS.siteName);

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
    domain,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: "Site created." };
}
