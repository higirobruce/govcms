import { Module } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { TenantController } from "./tenant.controller";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";

@Module({
  controllers: [TenantController],
  providers: [TenantService, TenantGuard, RolesGuard],
  exports: [TenantService, TenantGuard, RolesGuard],
})
export class TenantModule {}
