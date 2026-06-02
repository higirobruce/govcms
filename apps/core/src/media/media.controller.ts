import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { TenantGuard } from "../common/tenant.guard";
import { RolesGuard } from "../common/roles.guard";
import {
  CurrentMembership,
  Roles,
  type TenantMembership,
} from "../common/decorators";
import { MediaService } from "./media.service";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

@Controller("media")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@CurrentMembership() m: TenantMembership) {
    return this.media.list(m.tenantId);
  }

  @Post()
  @Roles("EDITOR", "ADMIN", "OWNER")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_BYTES } }))
  upload(
    @CurrentMembership() m: TenantMembership,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("No file uploaded.");
    return this.media.upload(m.tenantId, m.userId, file);
  }

  @Patch(":id")
  @Roles("EDITOR", "ADMIN", "OWNER")
  setAlt(
    @CurrentMembership() m: TenantMembership,
    @Param("id") id: string,
    @Body() body: { alt?: Record<string, string> },
  ) {
    return this.media.setAlt(m.tenantId, m.userId, id, body.alt ?? {});
  }

  @Delete(":id")
  @Roles("EDITOR", "ADMIN", "OWNER")
  remove(@CurrentMembership() m: TenantMembership, @Param("id") id: string) {
    return this.media.remove(m.tenantId, m.userId, id);
  }
}
