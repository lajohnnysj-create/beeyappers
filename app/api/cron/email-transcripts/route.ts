import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { renderTranscriptEmail } from "@/lib/email/transcript";

export const dynamic = "force-dynamic";
// Bounded work per run; frequent runs (every ~5 min) drain the queue. On Vercel
// Hobby this is capped at 10s, which a 25-email batch sent in parallel fits in.
export const maxDuration = 60;

const INACTIVITY_MINUTES = 30;
const BATCH = 25;

// Triggered by Supabase pg_cron (via pg_net), not by Vercel Cron. Protected by
// a shared secret so it can't be triggered by anyone on the public internet.
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET || "";
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = new Date(
    Date.now() - INACTIVITY_MINUTES * 60 * 1000
  ).toISOString();

  // Quiet, not-yet-emailed conversations on sites that have transcript emails
  // enabled. Oldest first so nothing starves.
  const { data: convos, error } = await admin
    .from("conversations")
    .select(
      "id, user_id, site_id, created_at, sites!inner(name, domain, email_transcripts)"
    )
    .lt("last_message_at", cutoff)
    .is("transcript_emailed_at", null)
    .eq("sites.email_transcripts", true)
    .order("last_message_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!convos || convos.length === 0) {
    return Response.json({ processed: 0, sent: 0 });
  }

  // Cache owner emails within this run (many conversations may share an owner).
  const emailCache = new Map<string, string | null>();
  async function ownerEmail(uid: string): Promise<string | null> {
    if (emailCache.has(uid)) return emailCache.get(uid) ?? null;
    const { data } = await admin.auth.admin.getUserById(uid);
    const e = data?.user?.email ?? null;
    emailCache.set(uid, e);
    return e;
  }

  const markDone = (id: string) =>
    admin
      .from("conversations")
      .update({ transcript_emailed_at: new Date().toISOString() })
      .eq("id", id);

  let sent = 0;

  await Promise.allSettled(
    convos.map(async (c: Record<string, unknown>) => {
      const convoId = c.id as string;
      const userId = c.user_id as string;
      const siteId = (c.site_id as string) || "";
      const startedAt = (c.created_at as string) || new Date().toISOString();
      const siteRaw = c.sites as
        | { name?: string; domain?: string | null }
        | { name?: string; domain?: string | null }[]
        | null;
      const site = Array.isArray(siteRaw) ? siteRaw[0] : siteRaw;

      const { data: msgs } = await admin
        .from("messages")
        .select("role, content, created_at")
        .eq("conversation_id", convoId)
        .order("created_at", { ascending: true });

      // Nothing to send, or no owner inbox to send to: retire it so it stops
      // being picked up every run.
      if (!msgs || msgs.length === 0) {
        await markDone(convoId);
        return;
      }
      const to = await ownerEmail(userId);
      if (!to) {
        await markDone(convoId);
        return;
      }

      const { subject, html, text } = renderTranscriptEmail({
        siteName: site?.name || "your site",
        domain: site?.domain ?? null,
        messages: msgs as { role: string; content: string; created_at: string }[],
        startedAt,
        dashboardUrl: `https://www.bleviq.com/dashboard/sites/${siteId}`,
      });

      // Send first, then mark. A failed send stays unmarked and retries next
      // run (better than marking sent and losing the transcript).
      await sendEmail({ to, subject, html, text });
      await markDone(convoId);
      sent += 1;
    })
  );

  return Response.json({ processed: convos.length, sent });
}
