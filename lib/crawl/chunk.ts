// Rough token estimate: ~4 chars per token. Avoids a tokenizer dependency.
const TARGET_CHARS = 3200; // ~800 tokens
const OVERLAP_CHARS = 320; // ~80 tokens
const MIN_CHARS = 120; // drop tiny fragments

export function chunkText(text: string): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (clean.length <= TARGET_CHARS) {
    return clean.length >= MIN_CHARS ? [clean] : [];
  }

  // Split on paragraph boundaries, then pack paragraphs up to the target size.
  const paras = clean.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";

  const flush = () => {
    const c = buf.trim();
    if (c.length >= MIN_CHARS) chunks.push(c);
    // Carry an overlap tail into the next buffer for context continuity.
    buf = c.length > OVERLAP_CHARS ? c.slice(c.length - OVERLAP_CHARS) : "";
  };

  for (const p of paras) {
    if (buf && buf.length + p.length + 2 > TARGET_CHARS) flush();
    // A single oversized paragraph gets hard-split.
    if (p.length > TARGET_CHARS) {
      for (let i = 0; i < p.length; i += TARGET_CHARS - OVERLAP_CHARS) {
        chunks.push(p.slice(i, i + TARGET_CHARS));
      }
      buf = "";
      continue;
    }
    buf = buf ? buf + "\n\n" + p : p;
  }
  if (buf.trim().length >= MIN_CHARS) chunks.push(buf.trim());

  return chunks;
}
