import { Injectable } from "@nestjs/common";
import { SignJWT } from "jose";
import * as bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository";
import { AuthError } from "../common/errors/app.error";
import type { AuthResponse } from "@reel-trip/types";
import type { SignupDto, LoginDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  private async signToken(payload: {
    sub: string;
    role: string;
  }): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "86400s")
      .sign(secret);
  }

  async signup(dto: SignupDto): Promise<AuthResponse> {
    if (await this.userRepository.existsByUsername(dto.username)) {
      throw AuthError.usernameAlreadyExists(dto.username);
    }
    if (await this.userRepository.existsByEmail(dto.email)) {
      throw AuthError.emailAlreadyExists(dto.email);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const role = "USER";

    await this.userRepository.create({
      username: dto.username,
      password: hashedPassword,
      email: dto.email,
      role,
    });

    return {
      accessToken: await this.signToken({ sub: dto.username, role }),
      tokenType: "Bearer",
      username: dto.username,
      email: dto.email,
      role,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) throw AuthError.invalidCredentials();

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw AuthError.invalidCredentials();

    return {
      accessToken: await this.signToken({
        sub: user.username,
        role: user.role,
      }),
      tokenType: "Bearer",
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
