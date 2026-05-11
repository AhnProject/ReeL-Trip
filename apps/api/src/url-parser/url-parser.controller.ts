import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { UrlParserService } from "./url-parser.service";
import { ParseUrlSchema, type ParseUrlDto } from "./dto/parse-url.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@Controller("url-parser")
@UseGuards(JwtAuthGuard)
export class UrlParserController {
  constructor(private readonly urlParserService: UrlParserService) {}

  @Post("parse")
  parse(@Body(new ZodValidationPipe(ParseUrlSchema)) dto: ParseUrlDto) {
    return this.urlParserService.parse(dto.url);
  }
}
