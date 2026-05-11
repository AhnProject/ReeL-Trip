export interface RawCollectedContent {
  title: string;
  caption: string;
  transcript: string | null;
  hashtags: string[];
  locationName: string | null;
  thumbnailUrl: string | null;
}

export interface ParsedTravelContent {
  name: string | null;
  category: "restaurant" | "cafe" | "attraction" | "accommodation" | "other" | null;
  location: {
    address: string | null;
    region: string | null;
    country: string | null;
  };
  price: {
    description: string | null;
    min: number | null;
    max: number | null;
    currency: string | null;
  };
  hours: string | null;
  menu: string[];
  tags: string[];
  description: string | null;
  sourceUrl: string;
  sourcePlatform: "youtube_shorts" | "instagram_reels";
  thumbnailUrl: string | null;
  confidence: "high" | "medium" | "low";
}
