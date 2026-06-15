import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embedTexts, toVectorLiteral } from "@/lib/embed/openai";
import { chunkText } from "@/lib/crawl/chunk";
import { extractDocText } from "@/lib/knowledge/extract-doc";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 25_000_000; // 25 MB per file
const MAX_TOTAL_DOC_BYTES = 50_000_000; // 50 MB of documents per site
const MAX_FAQS = 100; // per site
const MAX_DOC_CHUNKS = 300;
const INSERT_BATCH = 200;

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  const contentType = req.headers.get("content-type") || "";

  // ---- Document upload (multipart) ----
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const siteId = String(form.get("siteId") || "");
    const file = form.get("file") as File | null;
    if (!siteId || !file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .single();
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File must be under 25 MB." }, { status: 413 });
    }

    // Cumulative document budget per site (one sized row per document).
    const { data: docRows } = await supabase
      .from("chunks")
      .select("source_bytes")
      .eq("site_id", siteId)
      .eq("source_type", "document")
      .eq("chunk_index", 0);
    const usedBytes = (docRows ?? []).reduce(
      (sum, r) => sum + (r.source_bytes || 0),
      0
    );
    if (usedBytes + file.size > MAX_TOTAL_DOC_BYTES) {
      return NextResponse.json(
        { error: "This site's 50 MB document limit is reached. Remove a document to free up space." },
        { status: 413 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    let text: string;
    try {
      text = (await extractDocText(file.name, buf, file.type)).trim();
    } catch (e) {
      const m = e instanceof Error ? e.message : "Could not read file.";
      return NextResponse.json({ error: m }, { status: 400 });
    }
    if (text.length < 20) {
      return NextResponse.json(
        { error: "No readable text found in that file." },
        { status: 422 }
      );
    }

    const parts = chunkText(text).slice(0, MAX_DOC_CHUNKS);
    if (parts.length === 0) {
      return NextResponse.json({ error: "Nothing to add." }, { status: 422 });
    }

    const vectors = await embedTexts(parts);
    const sourceId = randomUUID();
    const rows = parts.map((content, i) => ({
      site_id: siteId,
      user_id: user.id,
      page_id: null,
      content,
      chunk_index: i,
      token_count: Math.round(content.length / 4),
      embedding: toVectorLiteral(vectors[i]),
      source_type: "document",
      source_label: file.name,
      source_id: sourceId,
      source_bytes: i === 0 ? file.size : null,
    }));
    for (let i = 0; i < rows.length; i += INSERT_BATCH) {
      const { error } = await admin.from("chunks").insert(rows.slice(i, i + INSERT_BATCH));
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true, chunks: parts.length });
  }

  // ---- JSON actions: faq | delete ----
  let body: { action?: string; siteId?: string; question?: string; answer?: string; sourceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const siteId = String(body.siteId || "");
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .single();
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  if (body.action === "faq") {
    const q = String(body.question || "").trim();
    const a = String(body.answer || "").trim();
    if (!q || !a) {
      return NextResponse.json(
        { error: "Both a question and an answer are required." },
        { status: 400 }
      );
    }

    const { count: faqCount } = await supabase
      .from("chunks")
      .select("*", { count: "exact", head: true })
      .eq("site_id", siteId)
      .eq("source_type", "faq");
    if ((faqCount ?? 0) >= MAX_FAQS) {
      return NextResponse.json(
        { error: "You've reached the limit of 100 FAQs. Remove one to add another." },
        { status: 409 }
      );
    }

    const content = "Q: " + q + "\nA: " + a;
    const [vec] = await embedTexts([content]);
    const { error } = await admin.from("chunks").insert({
      site_id: siteId,
      user_id: user.id,
      page_id: null,
      content,
      chunk_index: 0,
      token_count: Math.round(content.length / 4),
      embedding: toVectorLiteral(vec),
      source_type: "faq",
      source_label: q.slice(0, 140),
      source_id: randomUUID(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "faq-update") {
    const sourceId = String(body.sourceId || "");
    const q = String(body.question || "").trim();
    const a = String(body.answer || "").trim();
    if (!sourceId) return NextResponse.json({ error: "Missing item" }, { status: 400 });
    if (!q || !a) {
      return NextResponse.json(
        { error: "Both a question and an answer are required." },
        { status: 400 }
      );
    }

    // Confirm the FAQ exists and belongs to this user before re-embedding.
    const { data: existing } = await admin
      .from("chunks")
      .select("id")
      .eq("source_id", sourceId)
      .eq("user_id", user.id)
      .eq("source_type", "faq")
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });

    const content = "Q: " + q + "\nA: " + a;
    const [vec] = await embedTexts([content]);
    const { error } = await admin
      .from("chunks")
      .update({
        content,
        token_count: Math.round(content.length / 4),
        embedding: toVectorLiteral(vec),
        source_label: q.slice(0, 140),
      })
      .eq("source_id", sourceId)
      .eq("user_id", user.id)
      .eq("source_type", "faq");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "delete") {
    const sourceId = String(body.sourceId || "");
    if (!sourceId) return NextResponse.json({ error: "Missing item" }, { status: 400 });
    // user_id filter keeps deletion scoped to the owner.
    const { error } = await admin
      .from("chunks")
      .delete()
      .eq("source_id", sourceId)
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
