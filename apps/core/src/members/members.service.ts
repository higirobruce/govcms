import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import * as bcrypt from "bcryptjs";
import type { AddMemberInput, Role } from "@govcms/schema";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../content/audit.service";

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(tenantId: string) {
    return this.prisma.db.membership.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  /** Add a member by email. If no account exists, creates one with a temporary
   *  password (returned once so an admin can pass it on — real deployments wire
   *  this to an email invite / reset link). */
  async add(tenantId: string, actorId: string, input: AddMemberInput) {
    const result = await this.prisma.tenantTx(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: input.email } });
      let tempPassword: string | undefined;
      if (!user) {
        tempPassword = randomBytes(9).toString("base64url");
        user = await tx.user.create({
          data: {
            email: input.email,
            name: input.name ?? input.email.split("@")[0],
            passwordHash: await bcrypt.hash(tempPassword, 12),
          },
        });
      }

      const existing = await tx.membership.findUnique({
        where: { userId_tenantId: { userId: user.id, tenantId } },
      });
      if (existing) {
        throw new ConflictException("Already a member of this workspace.");
      }

      const membership = await tx.membership.create({
        data: { userId: user.id, tenantId, role: input.role },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "member.add",
        target: user.id,
        after: { email: user.email, role: input.role },
      });
      return { membership, tempPassword };
    });
    return result;
  }

  async setRole(tenantId: string, actorId: string, userId: string, role: Role) {
    const membership = await this.prisma.db.membership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    if (!membership) throw new NotFoundException("Member not found.");
    if (membership.role === "OWNER" && role !== "OWNER") {
      await this.assertNotLastOwner(tenantId);
    }
    const updated = await this.prisma.db.membership.update({
      where: { userId_tenantId: { userId, tenantId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await this.prisma.tenantTx((tx) =>
      this.audit.log(tx, {
        tenantId,
        actorId,
        action: "member.set_role",
        target: userId,
        before: { role: membership.role },
        after: { role },
      }),
    );
    return updated;
  }

  async remove(tenantId: string, actorId: string, userId: string) {
    const membership = await this.prisma.db.membership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    if (!membership) throw new NotFoundException("Member not found.");
    if (membership.role === "OWNER") await this.assertNotLastOwner(tenantId);

    await this.prisma.tenantTx(async (tx) => {
      await tx.membership.delete({
        where: { userId_tenantId: { userId, tenantId } },
      });
      await this.audit.log(tx, {
        tenantId,
        actorId,
        action: "member.remove",
        target: userId,
        before: { role: membership.role },
      });
    });
    return { ok: true };
  }

  private async assertNotLastOwner(tenantId: string) {
    const owners = await this.prisma.db.membership.count({
      where: { tenantId, role: "OWNER" },
    });
    if (owners <= 1) {
      throw new BadRequestException("A workspace must keep at least one owner.");
    }
  }
}
