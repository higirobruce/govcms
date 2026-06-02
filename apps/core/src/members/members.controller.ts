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
import { AddMemberInput, SetRoleInput } from "@govcms/schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import {
  CurrentMembership,
  Roles,
  type TenantMembership,
} from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { MembersService } from "./members.service";

@Controller("members")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("OWNER", "ADMIN")
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@CurrentMembership() m: TenantMembership) {
    return this.members.list(m.tenantId);
  }

  @Post()
  add(
    @CurrentMembership() m: TenantMembership,
    @Body(new ZodValidationPipe(AddMemberInput)) input: AddMemberInput,
  ) {
    return this.members.add(m.tenantId, m.userId, input);
  }

  @Patch(":userId")
  setRole(
    @CurrentMembership() m: TenantMembership,
    @Param("userId") userId: string,
    @Body(new ZodValidationPipe(SetRoleInput)) input: SetRoleInput,
  ) {
    return this.members.setRole(m.tenantId, m.userId, userId, input.role);
  }

  @Delete(":userId")
  remove(
    @CurrentMembership() m: TenantMembership,
    @Param("userId") userId: string,
  ) {
    return this.members.remove(m.tenantId, m.userId, userId);
  }
}
