import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import {
  CurrentMembership,
  Roles,
  type TenantMembership,
} from "../common/decorators";
import { AuditService } from "./audit.service";

@Controller()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ContentController {
  constructor(private readonly audit: AuditService) {}

  /** Audit trail — restricted to people who manage the workspace. */
  @Get("audit")
  @Roles("ADMIN", "OWNER")
  audits(
    @CurrentMembership() m: TenantMembership,
    @Query("limit") limit?: string,
  ) {
    return this.audit.list(m.tenantId, limit ? Number(limit) : undefined);
  }
}
