import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Anonymous, read-only delivery API. Serves ONLY published content, keyed by
 * tenant slug (no auth, no X-Tenant-Id) — this is what the public SSG site
 * consumes. It returns each entry's publishedVersion (what's live), never the
 * working draft.
 */
@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  private async tenantId(slug: string): Promise<string> {
    const t = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) throw new NotFoundException(`Unknown site "${slug}".`);
    return t.id;
  }

  async site(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { name: true, slug: true, locales: true, defaultLocale: true },
    });
    if (!tenant) throw new NotFoundException(`Unknown site "${slug}".`);
    return tenant;
  }

  async list(slug: string, opts: { type?: string; locale?: string }) {
    const tenantId = await this.tenantId(slug);
    const entries = await this.prisma.entry.findMany({
      where: {
        tenantId,
        status: "PUBLISHED",
        locale: opts.locale,
        publishedVersionId: { not: null },
        contentType: opts.type ? { key: opts.type } : undefined,
      },
      include: { publishedVersion: true, contentType: { select: { key: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return entries.map((e) => this.shape(e));
  }

  async one(slug: string, type: string, entrySlug: string, locale?: string) {
    const tenantId = await this.tenantId(slug);
    const entry = await this.prisma.entry.findFirst({
      where: {
        tenantId,
        status: "PUBLISHED",
        slug: entrySlug,
        locale,
        publishedVersionId: { not: null },
        contentType: { key: type },
      },
      include: { publishedVersion: true, contentType: { select: { key: true } } },
    });
    if (!entry) throw new NotFoundException("Page not found.");
    return this.shape(entry);
  }

  private shape(e: {
    id: string;
    slug: string;
    locale: string;
    updatedAt: Date;
    contentType: { key: string };
    publishedVersion: { data: unknown } | null;
  }) {
    const data = (e.publishedVersion?.data ?? {}) as Record<string, unknown>;
    return {
      id: e.id,
      type: e.contentType.key,
      slug: e.slug,
      locale: e.locale,
      title: (data.title as string) ?? e.slug,
      summary: (data.summary as string) ?? "",
      data,
      updatedAt: e.updatedAt,
    };
  }
}
