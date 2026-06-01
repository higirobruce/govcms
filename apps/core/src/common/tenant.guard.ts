import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser, TenantMembership } from "./decorators";

/**
 * Requires a resolved tenant (X-Tenant-Id) and an authenticated user, then
 * loads that user's membership in the tenant and attaches it to the request.
 * Denies access if the user is not a member — the app-layer half of tenant
 * isolation (Postgres row-level security is the database-layer half).
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<
      Request & {
        user?: AuthUser;
        tenantId?: string | null;
        membership?: TenantMembership;
      }
    >();

    if (!req.tenantId) {
      throw new BadRequestException("Missing X-Tenant-Id header.");
    }
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_tenantId: { userId: req.user.userId, tenantId: req.tenantId },
      },
    });
    if (!membership) {
      throw new ForbiddenException("No access to this tenant.");
    }

    req.membership = membership as TenantMembership;
    return true;
  }
}
