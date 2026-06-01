import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  CreateEntryInput,
  ListEntriesQuery,
  UpdateEntryInput,
  WORKFLOW_TRANSITIONS,
  WorkflowNoteInput,
  type WorkflowAction,
} from "@govcms/schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import {
  CurrentMembership,
  Roles,
  type TenantMembership,
} from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { EntriesService } from "./entries.service";

// Which roles may drive each workflow action.
const ACTION_ROLES: Record<WorkflowAction, TenantMembership["role"][]> = {
  submit: ["EDITOR", "ADMIN", "OWNER"],
  approve: ["REVIEWER", "ADMIN", "OWNER"],
  request_changes: ["REVIEWER", "ADMIN", "OWNER"],
  publish: ["ADMIN", "OWNER"],
  archive: ["ADMIN", "OWNER"],
  restore_to_draft: ["EDITOR", "ADMIN", "OWNER"],
};

@Controller("entries")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class EntriesController {
  constructor(private readonly entries: EntriesService) {}

  @Get()
  list(
    @CurrentMembership() m: TenantMembership,
    @Query(new ZodValidationPipe(ListEntriesQuery)) q: ListEntriesQuery,
  ) {
    return this.entries.list(m.tenantId, q);
  }

  @Get(":id")
  get(@CurrentMembership() m: TenantMembership, @Param("id") id: string) {
    return this.entries.getOrThrow(m.tenantId, id);
  }

  @Post()
  @Roles("EDITOR", "ADMIN", "OWNER")
  create(
    @CurrentMembership() m: TenantMembership,
    @Body(new ZodValidationPipe(CreateEntryInput)) input: CreateEntryInput,
  ) {
    return this.entries.create(m.tenantId, m.userId, input);
  }

  @Patch(":id")
  @Roles("EDITOR", "ADMIN", "OWNER")
  update(
    @CurrentMembership() m: TenantMembership,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateEntryInput)) input: UpdateEntryInput,
  ) {
    return this.entries.update(m.tenantId, m.userId, id, input);
  }

  @Get(":id/versions")
  versions(@CurrentMembership() m: TenantMembership, @Param("id") id: string) {
    return this.entries.listVersions(m.tenantId, id);
  }

  @Post(":id/versions/:versionId/restore")
  @Roles("EDITOR", "ADMIN", "OWNER")
  restore(
    @CurrentMembership() m: TenantMembership,
    @Param("id") id: string,
    @Param("versionId") versionId: string,
  ) {
    return this.entries.restoreVersion(m.tenantId, m.userId, id, versionId);
  }

  // One endpoint per workflow action; each guards its own roles.
  @Post(":id/:action(submit|approve|request_changes|publish|archive|restore_to_draft)")
  transition(
    @CurrentMembership() m: TenantMembership,
    @Param("id") id: string,
    @Param("action") action: WorkflowAction,
    @Body(new ZodValidationPipe(WorkflowNoteInput)) body: WorkflowNoteInput,
  ) {
    this.assertActionRole(action, m.role);
    // Defensive: action is constrained by the route regex, but validate anyway.
    if (!(action in WORKFLOW_TRANSITIONS)) {
      throw new Error(`Unknown action ${action}`);
    }
    return this.entries.transition(m.tenantId, m.userId, id, action, body.note);
  }

  private assertActionRole(action: WorkflowAction, role: TenantMembership["role"]) {
    if (!ACTION_ROLES[action].includes(role)) {
      throw new ForbiddenException(`Your role (${role}) cannot ${action}.`);
    }
  }
}
