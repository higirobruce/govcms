import { Injectable } from "@nestjs/common";
import type { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type Tx = PrismaClient | Prisma.TransactionClient;

/** Writes the immutable audit trail. Pass a transaction client so the log
 *  commits atomically with the change it records. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    tx: Tx,
    params: {
      tenantId: string;
      actorId: string;
      action: string;
      target: string;
      before?: unknown;
      after?: unknown;
    },
  ) {
    return tx.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorId: params.actorId,
        action: params.action,
        target: params.target,
        before: (params.before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: (params.after ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  list(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });
  }
}
