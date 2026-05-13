import { Injectable } from "@nestjs/common";
import { YoutubeTranscript } from "youtube-transcript";
import { AppError } from "../../common/errors/app.error";
import type { RawCollectedContent } from "../types/parsed-content.type";

interface YoutubeOEmbed {
  title: string;
  thumbnail_url: string;
  author_name: string;
}

@Injectable()
export class YoutubeShortCollector {
  async collect(videoId: string): Promise<RawCollectedContent> {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/${videoId}&format=json`
    );

    if (!oembedRes.ok) {
      throw new AppError(
        "YouTube Shorts 영상이 없거나 비공개 상태입니다",
        "PRIVATE_CONTENT",
        422
      );
    }

    const oembed = (await oembedRes.json()) as YoutubeOEmbed;

    let transcript: string | null = null;
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      const joined = segments.map((s) => s.text).join(" ").trim();
      transcript = joined || null;
    } catch {
      // 자막 없는 영상 — 계속 진행
    }

    return {
      title: oembed.title,
      caption: oembed.title,
      transcript,
      hashtags: extractHashtags(oembed.title),
      locationName: null,
      thumbnailUrl: oembed.thumbnail_url ?? null,
    };
  }
}

function extractHashtags(text: string): string[] {
  return (text.match(/#[\w가-힣]+/g) ?? []).map((tag) => tag.slice(1));
}
