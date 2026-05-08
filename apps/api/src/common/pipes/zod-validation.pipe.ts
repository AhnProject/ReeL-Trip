import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../errors/app.error";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          error.errors[0]!.message,
          "VALIDATION_ERROR",
          400
        );
      }
      throw error;
    }
  }
}
