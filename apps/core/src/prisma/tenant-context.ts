import { AsyncLocalStorage } from "node:async_hooks";

/** Per-request isolation context, consumed by the RLS Prisma extension to set
 *  Postgres session GUCs (app.tenant_id / app.user_id). `inTx` marks that a
 *  surrounding interactive transaction has already set the GUCs, so the
 *  extension must not open a nested transaction. */
export interface TenantContext {
  tenantId?: string;
  userId?: string;
  inTx?: boolean;
}

export const tenantStore = new AsyncLocalStorage<TenantContext>();

/** Run an async `fn` with an isolation context (merged over any current one).
 *  Awaits inside `run` so the query executes while the context is active —
 *  otherwise async_hooks loses the context before Prisma dispatches the query. */
export function withTenant<T>(
  ctx: TenantContext,
  fn: () => Promise<T>,
): Promise<T> {
  const current = tenantStore.getStore() ?? {};
  return tenantStore.run({ ...current, ...ctx }, async () => await fn());
}
