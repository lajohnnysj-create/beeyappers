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
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    try {
      const res = await parser.getText();
      return res?.text || "";
    } finally {
      await parser.destroy?.();
    }
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
