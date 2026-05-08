import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { AppError } from "../common/errors/app.error";
import { VECTOR_DIM } from "@reel-trip/utils";

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
}
