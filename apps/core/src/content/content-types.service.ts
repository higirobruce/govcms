import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContentTypesService {
  constructor(private readonly prisma: PrismaService) {}

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
}
