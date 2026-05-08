import { Module } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { DocumentRepository } from "./document.repository";
import { AiModule } from "../ai/ai.module";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Module({
  imports: [AiModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository, JwtAuthGuard],
  exports: [DocumentRepository],
})
export class DocumentModule {}
