import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CreateContentTypeInput,
  UpdateContentTypeInput,
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
import { ContentTypesService } from "./content-types.service";

@Controller("content-types")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ContentTypesController {
  constructor(private readonly types: ContentTypesService) {}

  /** Any member can read the types (the editor/list need them). */
  @Get()
  list(@CurrentMembership() m: TenantMembership) {
    return this.types.list(m.tenantId);
  }

  @Post()
  @Roles("OWNER", "ADMIN")
  create(
    @CurrentMembership() m: TenantMembership,
    @Body(new ZodValidationPipe(CreateContentTypeInput)) input: CreateContentTypeInput,
  ) {
    return this.types.create(m.tenantId, m.userId, input);
  }

  @Patch(":id")
  @Roles("OWNER", "ADMIN")
  update(
    @CurrentMembership() m: TenantMembership,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateContentTypeInput)) input: UpdateContentTypeInput,
  ) {
    return this.types.update(m.tenantId, m.userId, id, input);
  }

  @Delete(":id")
  @Roles("OWNER", "ADMIN")
  remove(@CurrentMembership() m: TenantMembership, @Param("id") id: string) {
    return this.types.remove(m.tenantId, m.userId, id);
  }
}
