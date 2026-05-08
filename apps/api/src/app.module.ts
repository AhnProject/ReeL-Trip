import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { DocumentModule } from "./document/document.module";
import { RecommendModule } from "./recommend/recommend.module";
import { DocsController } from "./docs/docs.controller";

@Module({
  imports: [PrismaModule, AuthModule, DocumentModule, RecommendModule],
  controllers: [DocsController],
})
export class AppModule {}
