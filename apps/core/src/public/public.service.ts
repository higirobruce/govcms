import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { withTenant } from "../prisma/tenant-context";

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
    const t = await this.prisma.db.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!t) throw new NotFoundException(`Unknown site "${slug}".`);
    return t.id;
  }

  async site(slug: string) {
    const tenant = await this.prisma.db.tenant.findUnique({
      where: { slug },
      select: { name: true, slug: true, locales: true, defaultLocale: true },
    });
    if (!tenant) throw new NotFoundException(`Unknown site "${slug}".`);
    return tenant;
  }

  async list(slug: string, opts: { type?: string; locale?: string }) {
    const tenantId = await this.tenantId(slug);
    const entries = await withTenant({ tenantId }, () =>
      this.prisma.db.entry.findMany({
        where: {
          tenantId,
          status: "PUBLISHED",
          locale: opts.locale,
          publishedVersionId: { not: null },
          contentType: opts.type ? { key: opts.type } : undefined,
        },
        include: { publishedVersion: true, contentType: { select: { key: true } } },
        orderBy: { updatedAt: "desc" },
      }),
    );
    return entries.map((e) => this.shape(e));
  }

  /** Full-text search over published content (title/summary/body), tenant-scoped.
   *  Runs the raw query inside tenantTx so the GUCs are set and RLS applies
   *  (raw queries bypass the model extension). */
  async search(slug: string, q: string, locale?: string) {
    const query = q.trim();
    if (!query) return [];
    const tenantId = await this.tenantId(slug);
    const rows = await withTenant({ tenantId }, () =>
      this.prisma.tenantTx((tx) =>
        tx.$queryRaw<
          { id: string; type: string; slug: string; locale: string; title: string; summary: string }[]
        >`
          SELECT e."id",
                 ct."key"  AS type,
                 e."slug",
                 e."locale",
                 COALESCE(ev."data"->>'title', e."slug") AS title,
                 COALESCE(ev."data"->>'summary', '')     AS summary
          FROM "Entry" e
          JOIN "EntryVersion" ev ON ev."id" = e."publishedVersionId"
          JOIN "ContentType"  ct ON ct."id" = e."contentTypeId"
          WHERE e."status" = 'PUBLISHED'
            AND (${locale ?? null}::text IS NULL OR e."locale" = ${locale ?? null})
            AND to_tsvector('simple',
                  COALESCE(ev."data"->>'title','')   || ' ' ||
                  COALESCE(ev."data"->>'summary','') || ' ' ||
                  COALESCE(ev."data"->>'body',''))
                @@ websearch_to_tsquery('simple', ${query})
          ORDER BY ts_rank(
                  to_tsvector('simple',
                    COALESCE(ev."data"->>'title','')   || ' ' ||
                    COALESCE(ev."data"->>'summary','') || ' ' ||
                    COALESCE(ev."data"->>'body','')),
                  websearch_to_tsquery('simple', ${query})) DESC
          LIMIT 20
        `,
      ),
    );
    return rows;
  }

  async one(slug: string, type: string, entrySlug: string, locale?: string) {
    const tenantId = await this.tenantId(slug);
    const entry = await withTenant({ tenantId }, () =>
      this.prisma.db.entry.findFirst({
        where: {
          tenantId,
          status: "PUBLISHED",
          slug: entrySlug,
          locale,
          publishedVersionId: { not: null },
          contentType: { key: type },
        },
        include: { publishedVersion: true, contentType: { select: { key: true } } },
      }),
    );
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
