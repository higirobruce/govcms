import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput } from "@govcms/schema";
import { PrismaService } from "../prisma/prisma.service";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.db.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException("Email already registered.");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.prisma.db.user.create({
      data: { email: input.email, name: input.name, passwordHash },
    });
    return this.sign(user.id, user.email, user.name);
  }

  async login(input: LoginInput) {
    const user = await this.prisma.db.user.findUnique({
      where: { email: input.email },
    });
    // Same error whether the user is missing or the password is wrong.
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    return this.sign(user.id, user.email, user.name);
  }

  async me(userId: string) {
    const user = await this.prisma.db.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: { tenant: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }

  private sign(id: string, email: string, name: string) {
    const token = this.jwt.sign({ sub: id, email });
    return { token, user: { id, email, name } };
  }
}
