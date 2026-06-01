import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { Role } from "@govcms/schema";
import type { Request } from "express";

/** The authenticated principal attached by JwtStrategy. */
export interface AuthUser {
  userId: string;
  email: string;
}

/** The caller's membership in the resolved tenant, attached by TenantGuard. */
export interface TenantMembership {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined =>
    ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>().user,
);

export const CurrentTenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null =>
    ctx.switchToHttp().getRequest<Request & { tenantId?: string | null }>()
      .tenantId ?? null,
);

export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantMembership | undefined =>
    ctx.switchToHttp().getRequest<Request & { membership?: TenantMembership }>()
      .membership,
);

export const ROLES_KEY = "roles";

/** Restrict a handler to the given tenant roles. Requires TenantGuard + RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
