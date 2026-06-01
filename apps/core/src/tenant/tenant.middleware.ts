import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { TENANT_HEADER } from "@govcms/schema";

/**
 * Resolves the active tenant from the X-Tenant-Id header and stashes it on the
 * request. (Subdomain-based resolution comes later; the contract stays the same.)
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(
    req: Request & { tenantId?: string | null },
    _res: Response,
    next: NextFunction,
  ): void {
    const header = req.headers[TENANT_HEADER];
    req.tenantId = (Array.isArray(header) ? header[0] : header) ?? null;
    next();
  }
}
