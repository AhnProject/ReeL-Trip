import { apiRequest } from "@/lib/api-client";

export interface ParsedResult {
  name: string | null;
  category: string | null;
  location: { address: string | null; region: string | null; country: string | null };
  price: { description: string | null; min: number | null; max: number | null; currency: string | null };
  hours: string | null;
  menu: string[];
  tags: string[];
  description: string | null;
  sourceUrl: string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl: string | null;
  confidence: "high" | "medium" | "low";
}

export function parseUrl(url: string, token: string) {
  return apiRequest<ParsedResult>(
    "/api/url-parser/parse",
    { method: "POST", body: JSON.stringify({ url: url.trim() }) },
    token,
    30000,
  );
}
