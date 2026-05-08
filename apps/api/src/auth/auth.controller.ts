import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  LoginSchema,
  SignupSchema,
  type LoginDto,
  type SignupDto,
} from "./dto/auth.dto";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body(new ZodValidationPipe(SignupSchema)) dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }
}
