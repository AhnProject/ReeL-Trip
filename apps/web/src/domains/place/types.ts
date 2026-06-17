/** 여행지(장소) 도메인 공용 타입 */

export interface ParsedLocation {
  address: string | null;
  region: string | null;
  country: string | null;
}

export interface ParsedPrice {
  description: string | null;
  min: number | null;
  max: number | null;
  currency: string | null;
}

/** URL 파서가 영상에서 추출한 여행지 정보 */
export interface ParsedResult {
  name: string | null;
  category: string | null;
  location: ParsedLocation;
  price: ParsedPrice;
  hours: string | null;
  menu: string[];
  tags: string[];
  description: string | null;
  sourceUrl: string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl: string | null;
  confidence: "high" | "medium" | "low";
}
