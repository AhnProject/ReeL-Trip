import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";
import { AppError } from "../errors/app.error";

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      return response.status(exception.httpStatus).json({
        success: false,
        data: null,
        message: exception.message,
        errorCode: exception.errorCode,
        timestamp: Date.now(),
      });
    }

    console.error(exception);
    return response.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
      errorCode: "INTERNAL_SERVER_ERROR",
      timestamp: Date.now(),
    });
  }
}
