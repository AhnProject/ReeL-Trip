import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { DocumentService } from "./document.service";
import {
  CreateDocumentSchema,
  UpdateDocumentSchema,
  SearchDocumentSchema,
  type CreateDocumentDto,
  type UpdateDocumentDto,
  type SearchDocumentDto,
} from "./dto/document.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@Controller("documents")
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get("health")
  health() {
    return { status: "ok" };
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateDocumentSchema)) dto: CreateDocumentDto) {
    return this.documentService.create(dto);
  }

  @Post("search")
  search(@Body(new ZodValidationPipe(SearchDocumentSchema)) dto: SearchDocumentDto) {
    return this.documentService.search(dto);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.documentService.findById(id);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateDocumentSchema)) dto: UpdateDocumentDto
  ) {
    return this.documentService.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.documentService.delete(id);
  }
}
