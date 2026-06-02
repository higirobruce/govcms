import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CreateContentTypeInput,
  UpdateContentTypeInput,
} from "@govcms/schema";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";

@Injectable()
export class ContentTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(tenantId: string) {
    return this.prisma.db.contentType.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
  }

  async findByKeyOrThrow(tenantId: string, key: string) {
    const type = await this.prisma.db.contentType.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });
    if (!type) {
      throw new NotFoundException(`Unknown content type "${key}".`);
    }
    return type;
  }

  async create(tenantId: string, actorId: string, input: CreateContentTypeInput) {
    this.assertUniqueFieldKeys(input.fields);
    try {
      return await this.prisma.tenantTx(async (tx) => {
        const type = await tx.contentType.create({
          data: {
            tenantId,
            key: input.key,
            name: input.name,
            schema: { fields: input.fields } as Prisma.InputJsonValue,
          },
        });
        await this.audit.log(tx, {
          tenantId,
          actorId,
          action: "contenttype.create",
          target: type.id,
          after: { key: type.key, fields: input.fields.length },
        });
        return type;
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException(`A content type "${input.key}" already exists.`);
      }
      throw e;
    }
  }

  async update(
    tenantId: string,
    actorId: string,
    id: string,
    input: UpdateContentTypeInput,
  ) {
    if (input.fields) this.assertUniqueFieldKeys(input.fields);
    const existing = await this.prisma.db.contentType.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException("Content type not found.");

    return this.prisma.tenantTx(async (tx) => {
      const data: Prisma.ContentTypeUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.fields !== undefined) {
        data.schema = { fields: input.fields } as Prisma.InputJsonValue;
      }
      const type = await tx.contentType.update({ where: { id }, data });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "contenttype.update",
        target: id,
        after: { name: type.name, fields: input.fields?.length },
      });
      return type;
    });
  }

  async remove(tenantId: string, actorId: string, id: string) {
    const existing = await this.prisma.db.contentType.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException("Content type not found.");

    const entries = await this.prisma.db.entry.count({
      where: { tenantId, contentTypeId: id },
    });
    if (entries > 0) {
      throw new BadRequestException(
        `Cannot delete — ${entries} entr${entries === 1 ? "y" : "ies"} still use this type.`,
      );
    }

    await this.prisma.tenantTx(async (tx) => {
      await tx.contentType.delete({ where: { id } });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "contenttype.remove",
        target: id,
        before: { key: existing.key },
      });
    });
    return { ok: true };
  }

  private assertUniqueFieldKeys(fields: { key: string }[]) {
    const keys = fields.map((f) => f.key);
    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException("Field keys must be unique within a type.");
    }
  }
}
