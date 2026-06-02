import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../content/audit.service";

// Local-disk storage for dev. Production swaps this for object storage (S3/MinIO)
// behind a CDN — Media.path abstracts the location.
export const UPLOADS_DIR = join(process.cwd(), "uploads");

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(tenantId: string) {
    return this.prisma.db.media.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async upload(tenantId: string, actorId: string, file: Express.Multer.File) {
    const ext = extname(file.originalname).slice(0, 12).replace(/[^.a-z0-9]/gi, "");
    const name = `${randomUUID()}${ext}`;
    const dir = join(UPLOADS_DIR, tenantId);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), file.buffer);
    const path = `/uploads/${tenantId}/${name}`;

    return this.prisma.tenantTx(async (tx) => {
      const media = await tx.media.create({
        data: {
          tenantId,
          path,
          mimeType: file.mimetype,
          altText: {} as Prisma.InputJsonValue,
          meta: { size: file.size, name: file.originalname } as Prisma.InputJsonValue,
        },
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "media.upload",
        target: media.id,
        after: { name: file.originalname, mimeType: file.mimetype },
      });
      return media;
    });
  }

  /** Per-locale alt text — accessibility is enforced at publish, sourced here. */
  async setAlt(tenantId: string, actorId: string, id: string, alt: Record<string, string>) {
    const existing = await this.prisma.db.media.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException("Media not found.");
    return this.prisma.tenantTx(async (tx) => {
      const media = await tx.media.update({
        where: { id },
        data: { altText: alt as Prisma.InputJsonValue },
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "media.set_alt",
        target: id,
        after: { alt },
      });
      return media;
    });
  }

  async remove(tenantId: string, actorId: string, id: string) {
    const existing = await this.prisma.db.media.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException("Media not found.");
    await this.prisma.tenantTx(async (tx) => {
      await tx.media.delete({ where: { id } });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "media.remove",
        target: id,
        before: { path: existing.path },
      });
    });
    // Best-effort file cleanup.
    try {
      await unlink(join(process.cwd(), existing.path.replace(/^\//, "")));
    } catch {
      /* ignore */
    }
    return { ok: true };
  }
}
