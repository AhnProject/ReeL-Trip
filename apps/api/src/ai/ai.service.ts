import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "../common/errors/app.error";
import { VECTOR_DIM } from "@reel-trip/utils";
import type { RawCollectedContent, ParsedTravelContent } from "../url-parser/types/parsed-content.type";

@Injectable()
export class AiService {
  private getClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
      throw new AppError(
        "OPENAI_API_KEY is required",
        "OPENAI_API_KEY_MISSING",
        500
      );
    return new OpenAI({ apiKey });
  }

  async createEmbedding(text: string): Promise<number[]> {
    const openai = this.getClient();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      dimensions: VECTOR_DIM,
    });
    return response.data[0]?.embedding ?? [];
  }

  async parseAndEmbed(userInput: string) {
    const openai = this.getClient();
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Extract keywords and return a refined search query as JSON with keys keywords and refinedQuery.",
        },
        { role: "user", content: userInput },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const rawJson = chatResponse.choices[0]?.message?.content ?? "{}";
    let parsed: { keywords?: string[]; refinedQuery?: string };
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new AppError(
        "Failed to parse OpenAI response JSON",
        "AI_RESPONSE_PARSE_ERROR",
        502
      );
    }

    const refinedQuery = parsed.refinedQuery?.trim() || userInput;
    const embedding = await this.createEmbedding(refinedQuery);

    return {
      originalText: userInput,
      keywords: parsed.keywords ?? [],
      refinedQuery,
      embedding,
    };
  }

  async extractTravelInfo(
    raw: RawCollectedContent
  ): Promise<Omit<ParsedTravelContent, "sourceUrl" | "sourcePlatform" | "thumbnailUrl">> {
    const content = [
      raw.title && `제목: ${raw.title}`,
      raw.caption && `설명: ${raw.caption.slice(0, 2000)}`,
      raw.transcript && `자막: ${raw.transcript.slice(0, 1500)}`,
      raw.locationName && `위치태그: ${raw.locationName}`,
      raw.hashtags.length && `해시태그: ${raw.hashtags.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `당신은 SNS 콘텐츠에서 여행/관광 정보를 추출하는 전문가입니다.
주어진 콘텐츠에서 정보를 추출해 JSON으로 반환하세요.
정보가 없으면 null, 배열 항목이 없으면 빈 배열로 반환하세요.
여행/관광 관련 정보가 전혀 없으면 name을 null로 반환하세요.

응답 형식:
{
  "name": "장소명 또는 가게명",
  "category": "restaurant|cafe|attraction|accommodation|other",
  "location": {
    "address": "주소",
    "region": "지역(도시/지방)",
    "country": "국가"
  },
  "price": {
    "description": "가격 설명 (예: 1인 30,000원)",
    "min": 숫자,
    "max": 숫자,
    "currency": "KRW|USD|JPY|EUR"
  },
  "hours": "영업시간",
  "menu": ["메뉴1", "메뉴2"],
  "tags": ["태그1", "태그2"],
  "description": "한 줄 요약",
  "confidence": "high|medium|low"
}`;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? (() => {
        throw new AppError("ANTHROPIC_API_KEY is required", "ANTHROPIC_API_KEY_MISSING", 500);
      })(),
    });

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawJson = textBlock?.type === "text" ? textBlock.text : "{}";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      throw new AppError("AI 응답 파싱 실패", "AI_RESPONSE_PARSE_ERROR", 502);
    }

    if (!parsed.name) {
      throw new AppError(
        "여행/관광 관련 정보를 찾을 수 없습니다",
        "EXTRACTION_FAILED",
        422
      );
    }

    const location = parsed.location as Record<string, unknown> | null;
    const price = parsed.price as Record<string, unknown> | null;

    return {
      name: (parsed.name as string) ?? null,
      category: (parsed.category as ParsedTravelContent["category"]) ?? null,
      location: {
        address: (location?.address as string) ?? null,
        region: (location?.region as string) ?? null,
        country: (location?.country as string) ?? null,
      },
      price: {
        description: (price?.description as string) ?? null,
        min: (price?.min as number) ?? null,
        max: (price?.max as number) ?? null,
        currency: (price?.currency as string) ?? null,
      },
      hours: (parsed.hours as string) ?? null,
      menu: Array.isArray(parsed.menu) ? (parsed.menu as string[]) : [],
      tags: Array.isArray(parsed.tags) ? (parsed.tags as string[]) : [],
      description: (parsed.description as string) ?? null,
      confidence: (parsed.confidence as ParsedTravelContent["confidence"]) ?? "low",
    };
  }
}
