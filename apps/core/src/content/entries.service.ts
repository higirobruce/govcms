import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  WORKFLOW_TRANSITIONS,
  type CreateEntryInput,
  type ListEntriesQuery,
  type UpdateEntryInput,
  type WorkflowAction,
} from "@govcms/schema";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";
import { ContentTypesService } from "./content-types.service";

const withVersions = {
  currentVersion: true,
  contentType: { select: { key: true, name: true } },
} satisfies Prisma.EntryInclude;

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly types: ContentTypesService,
    private readonly audit: AuditService,
  ) {}

  list(tenantId: string, q: ListEntriesQuery) {
    return this.prisma.db.entry.findMany({
      where: {
        tenantId,
        status: q.status,
        locale: q.locale,
        contentType: q.type ? { key: q.type } : undefined,
      },
      include: withVersions,
      orderBy: { updatedAt: "desc" },
    });
  }

  async getOrThrow(tenantId: string, id: string) {
    const entry = await this.prisma.db.entry.findFirst({
      where: { id, tenantId },
      include: withVersions,
    });
    if (!entry) {
      throw new NotFoundException("Entry not found.");
    }
    return entry;
  }

  async create(tenantId: string, actorId: string, input: CreateEntryInput) {
    const type = await this.types.findByKeyOrThrow(tenantId, input.contentTypeKey);
    try {
      return await this.prisma.tenantTx(async (tx) => {
        const entry = await tx.entry.create({
          data: {
            tenantId,
            contentTypeId: type.id,
            locale: input.locale,
            slug: input.slug,
            status: "DRAFT",
          },
        });
        const version = await tx.entryVersion.create({
          data: {
            entryId: entry.id,
            data: input.data as Prisma.InputJsonValue,
            authorId: actorId,
          },
        });
        await tx.workflowState.create({
          data: { entryId: entry.id, state: "DRAFT", actorId },
        });
        await this.audit.log(tx, {
          tenantId,
          actorId,
          action: "entry.create",
          target: entry.id,
          after: { slug: entry.slug, locale: entry.locale, type: type.key },
        });
        return tx.entry.update({
          where: { id: entry.id },
          data: { currentVersionId: version.id },
          include: withVersions,
        });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException(
          `An entry with slug "${input.slug}" already exists for this type and locale.`,
        );
      }
      throw e;
    }
  }

  async update(
    tenantId: string,
    actorId: string,
    id: string,
    input: UpdateEntryInput,
  ) {
    const entry = await this.getOrThrow(tenantId, id);
    return this.prisma.tenantTx(async (tx) => {
      const data: Prisma.EntryUpdateInput = {};
      if (input.slug !== undefined) data.slug = input.slug;
      if (input.data !== undefined) {
        // Editing appends an immutable version and moves the working pointer;
        // it never touches publishedVersion or status.
        const version = await tx.entryVersion.create({
          data: {
            entryId: id,
            data: input.data as Prisma.InputJsonValue,
            authorId: actorId,
          },
        });
        data.currentVersion = { connect: { id: version.id } };
      }
      const updated = await tx.entry.update({
        where: { id },
        data,
        include: withVersions,
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "entry.update",
        target: id,
        before: { slug: entry.slug },
        after: { slug: updated.slug, newVersion: input.data !== undefined },
      });
      return updated;
    });
  }

  async listVersions(tenantId: string, id: string) {
    await this.getOrThrow(tenantId, id);
    return this.prisma.db.entryVersion.findMany({
      where: { entryId: id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async restoreVersion(
    tenantId: string,
    actorId: string,
    id: string,
    versionId: string,
  ) {
    await this.getOrThrow(tenantId, id);
    const source = await this.prisma.db.entryVersion.findFirst({
      where: { id: versionId, entryId: id },
    });
    if (!source) {
      throw new NotFoundException("Version not found for this entry.");
    }
    return this.prisma.tenantTx(async (tx) => {
      const version = await tx.entryVersion.create({
        data: { entryId: id, data: source.data as Prisma.InputJsonValue, authorId: actorId },
      });
      const updated = await tx.entry.update({
        where: { id },
        data: { currentVersionId: version.id },
        include: withVersions,
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "entry.restore_version",
        target: id,
        after: { restoredFrom: versionId, newVersion: version.id },
      });
      return updated;
    });
  }

  async transition(
    tenantId: string,
    actorId: string,
    id: string,
    action: WorkflowAction,
    note?: string,
  ) {
    const entry = await this.getOrThrow(tenantId, id);
    const rule = WORKFLOW_TRANSITIONS[action];
    if (!(rule.from as readonly string[]).includes(entry.status)) {
      throw new BadRequestException(
        `Cannot "${action}" an entry that is ${entry.status}. Allowed from: ${rule.from.join(", ")}.`,
      );
    }
    if (action === "publish" && !entry.currentVersionId) {
      throw new BadRequestException("Nothing to publish — entry has no content.");
    }

    return this.prisma.tenantTx(async (tx) => {
      const data: Prisma.EntryUpdateInput = { status: rule.to };
      if (action === "publish") {
        data.publishedVersion = { connect: { id: entry.currentVersionId! } };
      } else if (action === "archive") {
        data.publishedVersion = { disconnect: true };
      }
      const updated = await tx.entry.update({
        where: { id },
        data,
        include: withVersions,
      });
      await tx.workflowState.create({
        data: { entryId: id, state: rule.to, actorId, note },
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: `entry.${action}`,
        target: id,
        before: { status: entry.status },
        after: { status: rule.to, note },
      });
      return updated;
    });
  }
}
