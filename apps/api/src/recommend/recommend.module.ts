import { Module } from "@nestjs/common";
import { RecommendController } from "./recommend.controller";
import { RecommendService } from "./recommend.service";
import { AiModule } from "../ai/ai.module";
import { DocumentModule } from "../document/document.module";

@Module({
  imports: [AiModule, DocumentModule],
  controllers: [RecommendController],
  providers: [RecommendService],
})
export class RecommendModule {}
