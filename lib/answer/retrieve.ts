import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toVectorLiteral } from "@/lib/embed/openai";

export type MatchedChunk = {
  id: string;
  content: string;
  similarity: number;
  url: string | null;
};

export async function retrieveChunks(
  admin: SupabaseClient,
  siteId: string,
  queryEmbedding: number[],
  matchCount: number,
  manualOnly = false
): Promise<MatchedChunk[]> {
  const { data, error } = await admin.rpc("match_chunks", {
    p_site_id: siteId,
    p_query_embedding: toVectorLiteral(queryEmbedding),
    p_match_count: matchCount,
    ...(manualOnly ? { p_manual_only: true } : {}),
  });
  if (error) throw new Error("Retrieval failed: " + error.message);
  return (data || []) as MatchedChunk[];
}
