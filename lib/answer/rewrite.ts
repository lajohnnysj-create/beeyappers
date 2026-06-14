import "server-only";

const MODEL = "gpt-4o-mini";

// Rewrite a raw visitor question into a concise knowledge-base search query.
// Best-effort: returns "" on any failure so the caller falls back to the
// original question.
export async function rewriteQuery(question: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return "";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 60,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "Rewrite a website visitor's question into a concise search " +
              "query for the site's knowledge base. Fix typos. Turn vague or " +
              "pronoun-based phrasing ('do you offer', 'how much do you " +
              "charge') into explicit terms about the business, its products, " +
              "services, plans, and pricing. Keep all key nouns. Output ONLY " +
              "the rewritten query with no quotes or extra text.",
          },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) return "";
    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return (json.choices?.[0]?.message?.content || "").trim();
  } catch {
    return "";
  }
}
