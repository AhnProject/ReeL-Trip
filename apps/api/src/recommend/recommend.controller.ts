import { Controller, Get, Post, Body } from "@nestjs/common";
import { RecommendService } from "./recommend.service";
import {
  RecommendSchema,
  type RecommendDto,
} from "./dto/recommend.dto";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@Controller("recommend")
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Get()
  health() {
    return {
      endpoint: "/api/recommend",
      description: "AI-powered travel recommendation",
    };
  }

  @Post()
  recommend(@Body(new ZodValidationPipe(RecommendSchema)) dto: RecommendDto) {
    return this.recommendService.recommend(dto);
  }
}
