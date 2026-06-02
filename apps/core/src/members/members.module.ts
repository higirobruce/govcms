import { Module } from "@nestjs/common";
import { ContentModule } from "../content/content.module";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";

@Module({
  imports: [ContentModule], // for AuditService
  controllers: [MembersController],
  providers: [MembersService, TenantGuard, RolesGuard],
})
export class MembersModule {}
