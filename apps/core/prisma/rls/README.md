# Row-Level Security (DB-layer tenant isolation)

`enable-rls.sql` is a **drafted, reviewed** policy set. It is **not** applied
automatically, and must not be enabled until the app threads tenant context
through **every** query path — otherwise published-site reads and the
cross-tenant workspace picker break (policies fail closed).

## Why it isn't on yet

RLS requires the database session to know the current tenant/user:

```sql
SELECT set_config('app.tenant_id', '<tenantId>', true);
SELECT set_config('app.user_id',   '<userId>', true);
```

With Prisma + a pooled connection, the only correct way to scope these to a
single request is to run the request's queries **inside one interactive
transaction** that sets the GUCs first (`is_local = true` ties them to the tx).
That means a deliberate change to how the services obtain their Prisma handle
(a request-scoped transactional client), not a drop-in.

## Wiring plan (the focused follow-up)

1. `AsyncLocalStorage` tenant context, populated by an interceptor that runs
   after `TenantGuard` (so `req.user` + `req.tenantId` exist), and by
   `PublicService`/`AuthService` for their paths.
2. A request-scoped Prisma accessor that opens an interactive transaction,
   `set_config(...)` for tenant + user, and runs the handler's queries on it.
3. Apply `enable-rls.sql` as a migration.
4. Verify: create tenants A and B; confirm a session scoped to A cannot read
   B's entries even via `prisma.$queryRaw`; confirm login, `/tenants`, and the
   public site still work.

Until then, isolation is enforced at the **app layer** (`TenantGuard` + every
query filtered by `tenantId`), which is real but is a single layer.
