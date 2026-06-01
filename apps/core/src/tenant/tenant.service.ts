import { ConflictException, Injectable } from "@nestjs/common";
import type { CreateTenantInput } from "@govcms/schema";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a tenant and makes the creator its OWNER, atomically. */
  async create(creatorUserId: string, input: CreateTenantInput) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: input.slug },
    });
    if (existing) {
      throw new ConflictException(`Slug "${input.slug}" is taken.`);
    }

    return this.prisma.tenant.create({
      data: {
        name: input.name,
        slug: input.slug,
        locales: input.locales,
        defaultLocale: input.defaultLocale,
        deploymentMode: input.deploymentMode,
        memberships: {
          create: { userId: creatorUserId, role: "OWNER" },
        },
      },
    });
  }

  /** Tenants the user belongs to, with their role in each. */
  async listForUser(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { tenant: true },
      orderBy: { createdAt: "asc" },
    });
    return memberships.map((m) => ({ ...m.tenant, role: m.role }));
  }

  async findById(tenantId: string) {
    return this.prisma.tenant.findUnique({ where: { id: tenantId } });
  }
}
