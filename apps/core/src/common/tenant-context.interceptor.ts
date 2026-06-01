import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import type { Request } from "express";
import { tenantStore } from "../prisma/tenant-context";
import type { AuthUser } from "./decorators";

/** Populates the AsyncLocalStorage isolation context for the request from the
 *  authenticated user (set by JwtAuthGuard) and the resolved tenant (header).
 *  Runs after guards, so req.user / req.tenantId are available. The explicit
 *  Observable wrapper guarantees the handler is subscribed inside the context. */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser; tenantId?: string | null }>();
    const store = {
      tenantId: req.tenantId ?? undefined,
      userId: req.user?.userId ?? undefined,
    };
    return new Observable((subscriber) => {
      tenantStore.run(store, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
