import { Module } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { DocumentRepository } from "./document.repository";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository],
  exports: [DocumentRepository],
})
export class DocumentModule {}
