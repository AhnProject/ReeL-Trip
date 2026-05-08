import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { jwtVerify } from "jose";
import { Request } from "express";
import { AuthError } from "../errors/app.error";

export const Public = () => SetMetadata("isPublic", true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

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
