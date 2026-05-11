import { Injectable } from "@nestjs/common";
import { AppError } from "../../common/errors/app.error";
import type { RawCollectedContent } from "../types/parsed-content.type";

interface ApifyReelItem {
  caption?: string;
  locationName?: string;
  hashtags?: string[];
  displayUrl?: string;
  thumbnailSrc?: string;
  error?: string;
}

@Injectable()
export class InstagramReelsCollector {
  private readonly ACTOR_ID = process.env.APIFY_ACTOR_ID ?? "apify~instagram-reel-scraper";

  async collect(reelUrl: string): Promise<RawCollectedContent> {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      throw new AppError(
        "APIFY_API_TOKEN이 설정되지 않았습니다",
        "APIFY_NOT_CONFIGURED",
        500
      );
    }

    const apiUrl =
      `https://api.apify.com/v2/acts/${this.ACTOR_ID}/run-sync-get-dataset-items` +
      `?token=${token}&timeout=60`;

    let res: Response;
    try {
      res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directUrls: [reelUrl] }),
      });
    } catch (e) {
      throw new AppError(`Apify 요청 실패: ${String(e)}`, "APIFY_ERROR", 502);
    }

    if (!res.ok) {
      const text = await res.text();
      throw new AppError(`Apify 오류 (${res.status}): ${text}`, "APIFY_ERROR", 502);
    }

    const items = (await res.json()) as ApifyReelItem[];
    const item = items[0];

    if (!item || item.error) {
      throw new AppError(
        item?.error ?? "릴스가 비공개이거나 접근할 수 없습니다",
        "PRIVATE_CONTENT",
        422
      );
    }

    const caption = item.caption ?? "";

    return {
      title: caption.split("\n")[0] ?? "",
      caption,
      transcript: null,
      hashtags: item.hashtags ?? extractHashtags(caption),
      locationName: item.locationName ?? null,
      thumbnailUrl: item.thumbnailSrc ?? item.displayUrl ?? null,
    };
  }
}

function extractHashtags(text: string): string[] {
  return (text.match(/#[\w가-힣]+/g) ?? []).map((tag) => tag.slice(1));
}
