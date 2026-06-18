import "server-only";

// Extract plain text from an uploaded document buffer.
export async function extractDocText(
  filename: string,
  buf: Buffer,
  mime: string
): Promise<string> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".txt") || lower.endsWith(".md") || mime.startsWith("text/")) {
    return buf.toString("utf-8");
  }

  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    // unpdf ships a DOM-free pdfjs build, so it extracts text in the Node /
    // serverless runtime without needing browser globals like DOMMatrix
    // (which is what pdf-parse/pdfjs tripped on).
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : text || "";
  }

  if (
    lower.endsWith(".docx") ||
    mime.includes("word") ||
    mime.includes("officedocument")
  ) {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ buffer: buf });
    return res.value || "";
  }

  throw new Error("Unsupported file type. Use PDF, DOCX, TXT, or MD.");
}
