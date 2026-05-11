import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { YoutubeShortCollector } from "./collectors/youtube-shorts.collector";
import { InstagramReelsCollector } from "./collectors/instagram-reels.collector";
import { detectUrl } from "./url-detector";
import { AppError } from "../common/errors/app.error";
import type { ParsedTravelContent } from "./types/parsed-content.type";

@Injectable()
export class UrlParserService {
  constructor(
    private readonly ai: AiService,
    private readonly youtube: YoutubeShortCollector,
    private readonly instagram: InstagramReelsCollector
  ) {}

  async parse(url: string): Promise<ParsedTravelContent> {
    const detected = detectUrl(url);

    if (detected.platform === "unsupported") {
      throw new AppError(
        "YouTube Shorts 또는 Instagram Reels URL만 지원합니다",
        "UNSUPPORTED_URL",
        400
      );
    }

    const raw =
      detected.platform === "youtube_shorts"
        ? await this.youtube.collect(detected.id!)
        : await this.instagram.collect(detected.normalizedUrl);

    const extracted = await this.ai.extractTravelInfo(raw);

    return {
      ...extracted,
      sourceUrl: detected.normalizedUrl,
      sourcePlatform: detected.platform,
      thumbnailUrl: raw.thumbnailUrl,
    };
  }
}
