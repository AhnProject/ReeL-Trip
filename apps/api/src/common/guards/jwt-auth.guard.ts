import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { jwtVerify } from "jose";
import { Request } from "express";
import { AuthError } from "../errors/app.error";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) throw AuthError.unauthorized();

    const token = authHeader.slice(7);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

    try {
      const { payload } = await jwtVerify(token, secret);
      (request as Request & { user: unknown }).user = payload;
      return true;
    } catch {
      throw AuthError.invalidToken();
    }
  }
}
