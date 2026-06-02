# Row-Level Security (DB-layer tenant isolation) — ENABLED

RLS is wired and enforced. `enable-rls.sql` is applied as a migration, and the
app connects as a **non-superuser role** so the policies actually bite.

## How it works

- **Policies** (`enable-rls.sql`): `ENABLE` + `FORCE` RLS on tenant-scoped tables;
  `USING`/`WITH CHECK` against `current_setting('app.tenant_id'|'app.user_id', true)`.
  Membership also allows the current user (cross-tenant workspace picker).
  Versions/workflow are scoped transitively via `Entry`.
- **App role** (`*_app_role` migration): `govcms_app` — non-superuser, non-owner,
  with DML grants. **Critical:** superusers (and the table owner under non-FORCE)
  bypass RLS, so the app must NOT connect as the owner.
  - App runtime → `DATABASE_URL` = `govcms_app`.
  - Migrations + seed → owner role (the `db:migrate` / `db:seed` scripts set it).
- **Context** (`tenant-context.ts` + `prisma.service.ts`): an `AsyncLocalStorage`
  holds `{ tenantId, userId }`. The `db` client extension wraps each standalone
  model op in a transaction that `set_config`s the GUCs; `tenantTx` does the same
  for interactive transactions. Context is set by `TenantContextInterceptor`
  (per request), `TenantGuard` (its membership lookup), and `PublicService`.

## Gotcha that bit us (keep it fixed)

`withTenant` must **await inside** `tenantStore.run(...)`. If it returns the
Prisma promise and the caller awaits it after `run()` exits, async_hooks has
already lost the context when Prisma dispatches the query → policies fail closed
(spurious 403 / empty results).

## Verified

As `govcms_app`: no context → 0 rows (fail-closed); correct tenant → scoped rows;
wrong tenant → 0. App flows (login, tenants, entries, workflow, public site) all
work; guard 403s non-members.

## Production note

The `docker-compose.prod.yml` / Dockerfile currently connect as the superuser
(`govcms`) for simplicity — **that bypasses RLS**. Before production, split prod
the same way: migrate/seed as owner, run the API as `govcms_app`.
