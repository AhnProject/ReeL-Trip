import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { DocumentModule } from "./document/document.module";
import { RecommendModule } from "./recommend/recommend.module";

@Module({
  imports: [PrismaModule, AuthModule, DocumentModule, RecommendModule],
})
export class AppModule {}
