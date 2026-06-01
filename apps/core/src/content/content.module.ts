import { Module } from "@nestjs/common";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import { AuditService } from "./audit.service";
import { ContentTypesService } from "./content-types.service";
import { EntriesService } from "./entries.service";
import { EntriesController } from "./entries.controller";
import { ContentController } from "./content.controller";

@Module({
  controllers: [EntriesController, ContentController],
  providers: [
    EntriesService,
    ContentTypesService,
    AuditService,
    TenantGuard,
    RolesGuard,
  ],
  exports: [AuditService],
})
export class ContentModule {}
