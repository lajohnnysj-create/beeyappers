import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toOrigin, discoverUrls } from "@/lib/crawl/sitemap";
import { fetchPage } from "@/lib/crawl/fetch-page";
import { extractContent } from "@/lib/crawl/extract";
import { chunkText } from "@/lib/crawl/chunk";
import { embedTexts, toVectorLiteral } from "@/lib/embed/openai";

export const runtime = "nodejs";
export const maxDuration = 60; // raise to 300 on Pro for larger sites

const MAX_PAGES = 40;
const MAX_CHUNKS = 1000;
const FETCH_CONCURRENCY = 8;
const INSERT_BATCH = 200;

type PageWork = { url: string; title: string; text: string };

// Fetch + extract a batch of URLs with limited concurrency.
async function harvest(urls: string[]): Promise<PageWork[]> {
  const out: PageWork[] = [];
  let i = 0;

  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      const html = await fetchPage(url);
      if (!html) continue;
      const { title, text } = extractContent(html);
      if (text && text.length > 120) out.push({ url, title, text });
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(FETCH_CONCURRENCY, urls.length) }, worker)
  );
  return out;
}

export async function POST(req: Request) {
  // 1. Authenticate the caller from the session, never from the body.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // 2. Validate input.
  let siteId: string;
  try {
    const body = await req.json();
    siteId = String(body.siteId || "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  // 3. Ownership check. RLS scopes this select to the signed-in user, so a
  //    row coming back means they own it.
  const { data: site } = await supabase
    .from("sites")
    .select("id, domain")
    .eq("id", siteId)
    .single();
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const origin = site.domain ? toOrigin(site.domain) : null;
  if (!origin) {
    return NextResponse.json(
      { error: "Set a valid domain on this site first." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    await admin
      .from("sites")
      .update({ crawl_status: "crawling" })
      .eq("id", siteId);

    // 4. Discover and harvest.
    const urls = await discoverUrls(origin, MAX_PAGES);
    const pages = await harvest(urls);

    if (pages.length === 0) {
      await admin
        .from("sites")
        .update({ crawl_status: "error" })
        .eq("id", siteId);
      return NextResponse.json(
        { error: "No crawlable content found at that domain." },
        { status: 422 }
      );
    }

    // 5. Destructive re-crawl: clear old pages (chunks cascade off the FK).
    await admin.from("pages").delete().eq("site_id", siteId);

    // 6. Insert pages, get their ids back keyed by url.
    const pageRows = pages.map((p) => ({
      site_id: siteId,
      user_id: user.id,
      url: p.url,
      title: p.title,
      content: p.text,
      status: "embedded",
      fetched_at: new Date().toISOString(),
    }));
    const { data: inserted, error: pageErr } = await admin
      .from("pages")
      .insert(pageRows)
      .select("id, url");
    if (pageErr) throw new Error("Page insert failed: " + pageErr.message);

    const idByUrl = new Map(inserted!.map((r) => [r.url, r.id]));

    // 7. Build chunks across all pages (capped).
    type ChunkWork = { page_id: string; content: string; chunk_index: number };
    const chunkWork: ChunkWork[] = [];
    for (const p of pages) {
      const pageId = idByUrl.get(p.url);
      if (!pageId) continue;
      const parts = chunkText(p.text);
      parts.forEach((content, idx) => {
        if (chunkWork.length < MAX_CHUNKS) {
          chunkWork.push({ page_id: pageId, content, chunk_index: idx });
        }
      });
    }

    if (chunkWork.length === 0) {
      await admin
        .from("sites")
        .update({ crawl_status: "error" })
        .eq("id", siteId);
      return NextResponse.json(
        { error: "Pages had no usable text to embed." },
        { status: 422 }
      );
    }

    // 8. Embed all chunk contents, then insert with vectors (batched).
    const vectors = await embedTexts(chunkWork.map((c) => c.content));

    for (let i = 0; i < chunkWork.length; i += INSERT_BATCH) {
      const slice = chunkWork.slice(i, i + INSERT_BATCH);
      const rows = slice.map((c, j) => ({
        site_id: siteId,
        page_id: c.page_id,
        user_id: user.id,
        content: c.content,
        chunk_index: c.chunk_index,
        token_count: Math.round(c.content.length / 4),
        embedding: toVectorLiteral(vectors[i + j]),
      }));
      const { error: chunkErr } = await admin.from("chunks").insert(rows);
      if (chunkErr) throw new Error("Chunk insert failed: " + chunkErr.message);
    }

    // 9. Mark ready.
    await admin
      .from("sites")
      .update({
        crawl_status: "ready",
        last_crawled_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    return NextResponse.json({
      ok: true,
      pages: pages.length,
      chunks: chunkWork.length,
    });
  } catch (err) {
    await admin
      .from("sites")
      .update({ crawl_status: "error" })
      .eq("id", siteId)
      .then(() => {});
    const message = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
