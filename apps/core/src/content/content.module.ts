import { Module } from "@nestjs/common";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import { AuditService } from "./audit.service";
import { ContentTypesService } from "./content-types.service";
import { EntriesService } from "./entries.service";
import { EntriesController } from "./entries.controller";
import { ContentController } from "./content.controller";
import { ContentTypesController } from "./content-types.controller";

@Module({
  controllers: [EntriesController, ContentController, ContentTypesController],
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
