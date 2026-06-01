import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { tenantStore } from "./tenant-context";

/** Builds an RLS-aware client: each model operation, when an isolation context
 *  is present and we're not already inside a context-setting transaction, runs
 *  inside a transaction that first sets the Postgres session GUCs. Raw ops and
 *  $transaction are not intercepted (extension targets $allModels only), so
 *  there is no recursion. */
function rlsExtended(base: PrismaClient) {
  return base.$extends({
    name: "rls",
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const ctx = tenantStore.getStore();
          if (!ctx || (!ctx.tenantId && !ctx.userId) || ctx.inTx) {
            return query(args);
          }
          // Set the GUCs and run the op in one transaction (one connection).
          // base (unextended) is used here so this stays out of the extension.
          const [, result] = await base.$transaction([
            base.$executeRaw`SELECT set_config('app.tenant_id', ${ctx.tenantId ?? ""}, true), set_config('app.user_id', ${ctx.userId ?? ""}, true)`,
            query(args),
          ]);
          return result;
        },
      },
    },
  });
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  /** Use this for all tenant-scoped model access (it enforces RLS context). */
  readonly db = rlsExtended(this);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log("Connected to Postgres");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Interactive transaction that sets the isolation GUCs once at the start and
   *  marks the context inTx (so nested model ops don't re-wrap). */
  tenantTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const ctx = tenantStore.getStore();
    return this.$transaction(async (tx) => {
      if (ctx && (ctx.tenantId || ctx.userId)) {
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${ctx.tenantId ?? ""}, true), set_config('app.user_id', ${ctx.userId ?? ""}, true)`;
      }
      return tenantStore.run({ ...(ctx ?? {}), inTx: true }, () => fn(tx));
    });
  }
}
