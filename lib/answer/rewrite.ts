import "server-only";
import type { ChatTurn } from "./generate";

const MODEL = "gpt-4o-mini";

// Rewrite a raw visitor question into a concise knowledge-base search query.
// When recent conversation is supplied, references like "he", "it", or "that"
// are resolved into explicit terms so a follow-up still retrieves the right
// content. Best-effort: returns "" on any failure so the caller falls back to
// the original question.
export async function rewriteQuery(
  question: string,
  history: ChatTurn[] = []
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return "";

  const userContent = history.length
    ? "Recent conversation (use it to resolve references):\n" +
      history
        .map((t) => `${t.role === "user" ? "Visitor" : "Assistant"}: ${t.content}`)
        .join("\n") +
      "\n\nLatest visitor question:\n" +
      question
    : question;

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
              "Rewrite a website visitor's latest question into a concise, " +
              "self-contained search query for the site's knowledge base. Fix " +
              "typos. If the question refers to something earlier in the " +
              "conversation (he, she, it, that, them), resolve it to the " +
              "explicit name or noun using the conversation so the query " +
              "stands on its own. Turn vague or pronoun-based phrasing ('do " +
              "you offer', 'how much do you charge') into explicit terms about " +
              "the business, its products, services, plans, and pricing. Keep " +
              "all key nouns. Output ONLY the rewritten query with no quotes " +
              "or extra text.",
          },
          { role: "user", content: userContent },
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
