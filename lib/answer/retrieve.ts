import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toVectorLiteral } from "@/lib/embed/openai";

export type MatchedChunk = { id: string; content: string; similarity: number };

export async function retrieveChunks(
  admin: SupabaseClient,
  siteId: string,
  queryEmbedding: number[],
  matchCount: number,
  sourceType?: "faq" | "page" | "document"
): Promise<MatchedChunk[]> {
  const { data, error } = await admin.rpc("match_chunks", {
    p_site_id: siteId,
    p_query_embedding: toVectorLiteral(queryEmbedding),
    p_match_count: matchCount,
    ...(sourceType ? { p_source_type: sourceType } : {}),
  });
  if (error) throw new Error("Retrieval failed: " + error.message);
  return (data || []) as MatchedChunk[];
}
