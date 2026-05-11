export type UrlPlatform = "youtube_shorts" | "instagram_reels" | "unsupported";

export interface DetectedUrl {
  platform: UrlPlatform;
  id: string | null;
  normalizedUrl: string;
}

export function detectUrl(rawUrl: string): DetectedUrl {
  const url = rawUrl.trim();

  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return {
      platform: "youtube_shorts",
      id: shortsMatch[1],
      normalizedUrl: `https://www.youtube.com/shorts/${shortsMatch[1]}`,
    };
  }

  const reelsMatch = url.match(/instagram\.com\/(?:reel|reels)\/([a-zA-Z0-9_-]+)/);
  if (reelsMatch) {
    return {
      platform: "instagram_reels",
      id: reelsMatch[1],
      normalizedUrl: `https://www.instagram.com/reel/${reelsMatch[1]}/`,
    };
  }

  return { platform: "unsupported", id: null, normalizedUrl: url };
}
