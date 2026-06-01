import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { Role } from "@govcms/schema";
import { ROLES_KEY, type TenantMembership } from "./decorators";

/** Enforces @Roles(...) against the membership loaded by TenantGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const req = ctx
      .switchToHttp()
      .getRequest<Request & { membership?: TenantMembership }>();
    const role = req.membership?.role;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException("Insufficient role for this action.");
    }
    return true;
  }
}
