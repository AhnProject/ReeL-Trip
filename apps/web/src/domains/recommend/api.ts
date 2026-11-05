import { apiRequest } from "@/lib/api-client";
import type { RecommendOutput } from "@reel-trip/types";

export function recommend(query: string, token: string, topK = 5, threshold = 0.5) {
  return apiRequest<RecommendOutput>("/api/recommend", {
    method: "POST",
    body: JSON.stringify({ query, topK, threshold }),
  }, token);
}
