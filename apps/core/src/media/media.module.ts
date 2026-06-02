import { Module } from "@nestjs/common";
import { ContentModule } from "../content/content.module";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";

@Module({
  imports: [ContentModule], // for AuditService
  controllers: [MediaController],
  providers: [MediaService, TenantGuard, RolesGuard],
})
export class MediaModule {}
