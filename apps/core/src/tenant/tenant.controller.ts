import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { CreateTenantInput } from "@govcms/schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/tenant.guard";
import {
  CurrentMembership,
  CurrentUser,
  type AuthUser,
  type TenantMembership,
} from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { TenantService } from "./tenant.service";

@Controller("tenants")
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenants: TenantService) {}

  /** Tenants the current user can access. */
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.tenants.listForUser(user.userId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTenantInput))
  create(@CurrentUser() user: AuthUser, @Body() input: CreateTenantInput) {
    return this.tenants.create(user.userId, input);
  }

  /** Details of the tenant named in X-Tenant-Id (requires membership). */
  @Get("current")
  @UseGuards(TenantGuard)
  async current(@CurrentMembership() membership: TenantMembership) {
    const tenant = await this.tenants.findById(membership.tenantId);
    return { ...tenant, role: membership.role };
  }
}
