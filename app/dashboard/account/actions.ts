"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/billing/stripe";

/**
 * Change the signed-in user's password. The server client already holds the
 * session, so updateUser is all we need — no recovery email round-trip.
 */
export async function changePassword(newPassword: string) {
  const pw = newPassword || "";
  if (pw.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) return { error: error.message };

  return { ok: "Password updated." };
}

/**
 * Permanently delete the signed-in user's account.
 *
 * Order is deliberate:
 *   1. Cancel the Stripe subscription FIRST. Stripe is external; no database
 *      cascade reaches it, so a live subscription would keep billing after the
 *      account is gone. If the cancel fails for any reason other than "already
 *      gone", we stop here rather than orphan a live subscription.
 *   2. delete_my_account() (SECURITY DEFINER) removes the user's storage assets
 *      and sites, which cascades pages, chunks, conversations, and messages.
 *   3. Delete the auth user (service role). This cascades the subscriptions row
 *      (user_id is ON DELETE CASCADE to auth.users).
 *   4. Clear the now-defunct session and send them to a confirmation screen.
 */
export async function deleteAccount(confirmText: string) {
  if ((confirmText || "").trim().toUpperCase() !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Signed out. Refresh and sign in again." };

  // 1) Stripe first. Read the id with the user-scoped client (RLS confines it
  // to their own row), then cancel immediately.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const subId = sub?.stripe_subscription_id;
  if (subId) {
    try {
      await getStripe().subscriptions.cancel(subId);
    } catch (e) {
      const code =
        (e as { code?: string; raw?: { code?: string } })?.code ||
        (e as { raw?: { code?: string } })?.raw?.code;
      // "resource_missing" = Stripe already has no such subscription, fine.
      // Anything else means we can't be sure billing stopped, so don't delete.
      if (code !== "resource_missing") {
        return {
          error:
            "We couldn't cancel your subscription just now. Please try again, or contact support so you aren't billed.",
        };
      }
    }
  }

  // The service-role client handles storage cleanup and the auth-user delete.
  const admin = createAdminClient();

  // 2) Remove the user's uploaded assets via the Storage API. Direct SQL
  // DELETE on storage.objects is blocked by Supabase, so this can no longer
  // live inside delete_my_account(). Files live under `${userId}/${siteId}/…`,
  // so enumerate the user's sites first, then clear each. Best-effort: don't
  // block account deletion if a file lingers.
  try {
    const { data: ownSites } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id);
    for (const s of ownSites ?? []) {
      const prefix = `${user.id}/${s.id}`;
      const { data: files } = await admin.storage
        .from("widget-assets")
        .list(prefix);
      if (files && files.length) {
        await admin.storage
          .from("widget-assets")
          .remove(files.map((f) => `${prefix}/${f.name}`));
      }
    }
  } catch {
    /* non-fatal: proceed even if some storage objects linger */
  }

  // 3) Purge the user's data: sites, which cascades pages, chunks,
  // conversations, and messages. Runs as the user via SECURITY DEFINER.
  const { error: purgeErr } = await supabase.rpc("delete_my_account");
  if (purgeErr) return { error: purgeErr.message };

  // 4) Delete the auth user (cascades the subscriptions row).
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return { error: delErr.message };

  // 5) Leave a privacy-safe tombstone so we can later answer "was this account
  // intentionally deleted, and when" without retaining any PII. It stores only
  // a one-way hash of the user id, a timestamp, and a non-identifying churn
  // flag — never email, name, or content. By design this table has no FK to
  // auth.users and is NOT touched by delete_my_account(), so it outlives the
  // account. Best-effort: the account is already gone, so never block on it.
  try {
    const userHash = createHash("sha256").update(user.id).digest("hex");
    await admin.from("account_deletions").insert({
      user_hash: userHash,
      reason: "user_requested",
      had_subscription: !!subId,
    });
  } catch {
    /* tombstone is best-effort; deletion already succeeded */
  }

  // 6) Clear cookies for the deleted session, then off they go.
  try {
    await supabase.auth.signOut();
  } catch {
    /* session is already invalid; cookies still get cleared */
  }
  redirect("/login?deleted=1");
}
