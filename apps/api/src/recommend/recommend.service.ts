import { Injectable } from "@nestjs/common";
import { DocumentRepository } from "../document/document.repository";
import { AiService } from "../ai/ai.service";
import type { RecommendDto } from "./dto/recommend.dto";

@Injectable()
export class RecommendService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly aiService: AiService
  ) {}

  async recommend(dto: RecommendDto) {
    const parsed = await this.aiService.parseAndEmbed(dto.query);
    const results = await this.documentRepository.searchByVector(
      parsed.embedding,
      dto.topK,
      dto.threshold
    );

    return {
      originalQuery: parsed.originalText,
      refinedQuery: parsed.refinedQuery,
      keywords: parsed.keywords,
      results: results.map((d) => ({
        id: d.id.toString(),
        title: d.title,
        content: d.content,
        similarity: d.similarity,
        createdAt: d.createdAt.toISOString(),
      })),
      totalCount: results.length,
    };
  }
}
