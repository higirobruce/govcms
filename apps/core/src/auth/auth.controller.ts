import { Body, Controller, Get, Post, UseGuards, UsePipes } from "@nestjs/common";
import { LoginInput, RegisterInput } from "@govcms/schema";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser, type AuthUser } from "../common/decorators";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(RegisterInput))
  register(@Body() input: RegisterInput) {
    return this.auth.register(input);
  }

  @Post("login")
  @UsePipes(new ZodValidationPipe(LoginInput))
  login(@Body() input: LoginInput) {
    return this.auth.login(input);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId);
  }
}
