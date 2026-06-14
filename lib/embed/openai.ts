import "server-only";

const MODEL = "text-embedding-3-small"; // 1536 dims, matches the schema
const BATCH = 96;

// Returns one 1536-length vector per input, in the same order.
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: MODEL, input: batch }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Embedding request failed (${res.status}): ${detail}`);
    }

    const json = (await res.json()) as {
      data: { index: number; embedding: number[] }[];
    };
    // Preserve order within the batch.
    json.data
      .sort((a, b) => a.index - b.index)
      .forEach((d) => out.push(d.embedding));
  }

  return out;
}

// pgvector accepts a bracketed string literal for inserts via PostgREST.
export function toVectorLiteral(vec: number[]): string {
  return "[" + vec.join(",") + "]";
}
