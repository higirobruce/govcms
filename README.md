# govcms

An open-source, multi-tenant content platform for government — a "WordPress for governments." Modern, hireable tech; accessibility, multilingual delivery, and editorial accountability built into the core.

> **The plan lives in [`docs/implementation.html`](docs/implementation.html)** and is a living document. Read it before structural work; update it as decisions land. Project conventions are in [`CLAUDE.md`](CLAUDE.md).

## Stack

NestJS · React + shadcn/ui + Tailwind · Next.js · PostgreSQL · Prisma · pnpm + Turborepo

## Layout

```
apps/core/        NestJS — API, tenancy, auth (more to come)
packages/schema/  shared types + zod validators
docs/             the living implementation plan
```

## Quickstart (Phase 0)

```bash
pnpm install
pnpm db:up                 # start Postgres in Docker (host port 5434)

pnpm --filter @govcms/schema build
pnpm db:generate           # prisma client
pnpm db:migrate            # create the schema
pnpm db:seed               # demo tenant + admin user

pnpm --filter @govcms/core dev   # http://localhost:4001/api
```

Smoke test:

```bash
curl localhost:4001/api/health
curl -X POST localhost:4001/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@govcms.local","password":"changeme-now-please"}'
```

## Status

Design + Phase 0 (scaffold). See the plan's build-order table.
