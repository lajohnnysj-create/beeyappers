import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { baseLang, languageName } from "@/lib/lang";
import crypto from "crypto";

// The greeting is author-written; the rest are our fixed UI chrome. The
// assistant NAME is deliberately NOT here: names are kept exactly as the owner
// wrote them. Suggestion chips and live answers are produced in-language by the
// model at request time, so they aren't cached here either.
export type WidgetStrings = {
  greeting: string;
  placeholder: string;
  send: string;
  poweredBy: string;
  askAI: string;
};

const TRANSLATE_MODEL = "gpt-4o-mini";

function hashSource(s: WidgetStrings): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(s))
    .digest("hex")
    .slice(0, 16);
}

// Merge a possibly-partial model result over the source so a missing or blank
// field never blanks out the widget.
function coalesce(
  obj: Partial<Record<keyof WidgetStrings, unknown>>,
  source: WidgetStrings
): WidgetStrings {
  const pick = (k: keyof WidgetStrings) => {
    const v = obj[k];
    return typeof v === "string" && v.trim() ? v.trim() : source[k];
  };
  return {
    greeting: pick("greeting"),
    placeholder: pick("placeholder"),
    send: pick("send"),
    poweredBy: pick("poweredBy"),
    askAI: pick("askAI"),
  };
}

async function translateStrings(
  source: WidgetStrings,
  base: string
): Promise<WidgetStrings | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const name = languageName(base);
  const sys = [
    `Translate the string VALUES of the given JSON into ${name} (BCP-47 "${base}").`,
    "Return ONLY a JSON object with the SAME keys and translated values.",
    "Use natural, native phrasing for a website chat widget. Keep it concise and",
    "preserve the punctuation style. Do NOT translate brand or product names. If a",
    "value is already in the target language, return it unchanged.",
  ].join(" ");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: TRANSLATE_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(source) },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const raw = (json.choices?.[0]?.message?.content || "").trim();
    const parsed = JSON.parse(raw) as Partial<Record<keyof WidgetStrings, unknown>>;
    return coalesce(parsed, source);
  } catch {
    return null;
  }
}

// Resolve the widget's strings for a visitor's language. English (our source
// language) and unknown tags return the author's text untouched with no model
// call. Other languages are translated once per (site, language, content) and
// cached in `widget_translations`; every later visitor in that language is a
// single fast row read. Any failure falls back to the source strings so the
// widget never renders blank.
export async function getWidgetStrings(
  siteId: string,
  lang: string,
  source: WidgetStrings
): Promise<WidgetStrings> {
  const base = baseLang(lang);
  if (!base || base === "en") return source;

  const sourceHash = hashSource(source);
  const admin = createAdminClient();

  try {
    const { data } = await admin
      .from("widget_translations")
      .select("payload, source_hash")
      .eq("site_id", siteId)
      .eq("lang", base)
      .maybeSingle();
    if (data && data.source_hash === sourceHash && data.payload) {
      return coalesce(
        data.payload as Partial<Record<keyof WidgetStrings, unknown>>,
        source
      );
    }
  } catch {
    /* fall through to translate */
  }

  const translated = await translateStrings(source, base);
  if (!translated) return source;

  try {
    await admin.from("widget_translations").upsert(
      {
        site_id: siteId,
        lang: base,
        source_hash: sourceHash,
        payload: translated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "site_id,lang" }
    );
  } catch {
    /* cache write is best-effort */
  }

  return translated;
}
