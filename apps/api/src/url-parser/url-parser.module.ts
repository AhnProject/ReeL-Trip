import { Module } from "@nestjs/common";
import { UrlParserController } from "./url-parser.controller";
import { UrlParserService } from "./url-parser.service";
import { YoutubeShortCollector } from "./collectors/youtube-shorts.collector";
import { InstagramReelsCollector } from "./collectors/instagram-reels.collector";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [UrlParserController],
  providers: [UrlParserService, YoutubeShortCollector, InstagramReelsCollector],
})
export class UrlParserModule {}
