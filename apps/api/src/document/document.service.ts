import { Injectable } from "@nestjs/common";
import { DocumentRepository } from "./document.repository";
import { AiService } from "../ai/ai.service";
import { DocumentError } from "../common/errors/app.error";
import type {
  CreateDocumentDto,
  UpdateDocumentDto,
  SearchDocumentDto,
} from "./dto/document.dto";

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly aiService: AiService
  ) {}

  async create(dto: CreateDocumentDto) {
    const embedding =
      dto.embedding && dto.embedding.length > 0
        ? dto.embedding
        : await this.aiService.createEmbedding(`${dto.title} ${dto.content}`);
    const id = await this.documentRepository.create({
      title: dto.title,
      content: dto.content,
      embedding,
    });
    return { id: id.toString() };
  }

  async findAll() {
    const docs = await this.documentRepository.findAll();
    return docs.map((d) => ({
      id: d.id.toString(),
      title: d.title,
      content: d.content,
      embedding: d.embedding,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt?.toISOString() ?? null,
    }));
  }

  async findById(id: string) {
    const doc = await this.documentRepository.findById(BigInt(id));
    if (!doc) throw DocumentError.notFound(id);
    return {
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      embedding: doc.embedding,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt?.toISOString() ?? null,
    };
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const affected = await this.documentRepository.update(BigInt(id), {
      title: dto.title,
      content: dto.content,
      embedding: dto.embedding ?? null,
    });
    if (affected === 0) throw DocumentError.notFound(id);
  }

  async delete(id: string) {
    const affected = await this.documentRepository.delete(BigInt(id));
    if (affected === 0) throw DocumentError.notFound(id);
  }

  async search(dto: SearchDocumentDto) {
    const docs = await this.documentRepository.searchByVector(
      dto.embedding,
      dto.limit ?? 10,
      dto.threshold
    );
    return docs.map((d) => ({
      id: d.id.toString(),
      title: d.title,
      content: d.content,
      embedding: d.embedding,
      similarity: d.similarity,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt?.toISOString() ?? null,
    }));
  }
}
