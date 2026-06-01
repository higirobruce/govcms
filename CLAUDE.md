# govcms

An open-source, multi-tenant content platform for the Government of Rwanda — a "WordPress for governments." Modern, hireable tech; accessibility, multilingual delivery, and editorial accountability built into the core rather than bolted on. It exists to replace TYPO3, whose maintenance burden stems from a small talent pool and community rather than bad technology.

## The plan is the source of truth

**`docs/implementation.html` is a living document.** It holds the architecture, locked decisions, data model, repo layout, MVP scope, and phased build order. Read it before making structural decisions, and **update it as decisions land** — when an open decision is resolved or a phase changes status, edit the HTML in the same change. Match the existing design-system styling (it shares tokens with the `aux` docs).

Open the plan: `open docs/implementation.html`

## Non-negotiables (these constrain every decision)

1. **Boring, conventional tech** — optimize for hireability. NestJS, React + shadcn/ui + Tailwind, Next.js, PostgreSQL. Nothing exotic that recreates the TYPO3 trap.
2. **Open source from day one** — public repo, docs, roadmap. A community can't be retrofitted.
3. **Plugin architecture** — small stable core; features live at the edges. First-party features are built as plugins against the same public `plugin-api` an outsider would use.
4. **Conform to the RISA Websites Guideline** — every site the platform produces must satisfy it. Conformance is *structural*: the design system and delivery layer make a non-conforming site hard to produce. Do not push compliance onto editors.

## Key references

- RISA Websites Guideline (binding): https://guidelines.risa.gov.rw/books/government-of-rwanda-websites-guideline
- Official national symbols (asset source, **determined by law**): https://www.gov.rw/government/publications/national-symbols
  - Coat of Arms, Government Logo, National Flag, National Anthem. When building `packages/design-system`, **vendor these files into the repo** with source + retrieval date — do not hot-link at build time, so builds stay reproducible. Never re-draw or recolour them.

## Locked decisions

- **Tenancy:** hybrid — shared multi-tenant platform for most sites; dedicated isolated instances for high-sensitivity ones (defense, presidency). Same codebase; "dedicated" is a deployment topology, not a fork. Every query carries `tenant_id`; Postgres row-level security enforces isolation.
- **Delivery:** static generation + ISR (Next.js). The CMS never serves citizen traffic — it emits static output to a CDN.
- **First target:** one real pilot ministry, end to end, before generalizing.

## Planned repo layout (not yet scaffolded)

```
apps/core/        NestJS — API, RBAC, workflow, plugin host
apps/admin/       React + shadcn/ui + Tailwind editor
apps/site/        Next.js — public SSG/ISR delivery (the pilot)
packages/design-system/  gov component library + national identity
packages/content-sdk/    typed client the site uses
packages/schema/         shared types + zod validators
packages/plugin-api/     the contract plugins implement
plugins/          first-party plugins, built against plugin-api
```

## Conventions

- **Staging-first:** every change lands on `staging` before `main`, via PR. Branch before committing on a default branch.
- Keep the core small; if a feature can be a plugin, it is one.
- Accessibility (WCAG 2.2 AA) is enforced at publish, not advisory.
- Multilingual is a core data concept (rw / en / fr / sw), not a plugin.

## Status

**Phase 1 done** (v0.1). Standalone repo at `~/Documents/development/govcms` (moved out of `aux`). Monorepo (pnpm + Turborepo), Postgres via Docker on host port **5434**, Core API on port **4001** (both chosen to avoid clashing with the `aux` project's 5433/4000).

- **Phase 0:** Prisma data model + tenant/auth skeleton (register/login/JWT, `X-Tenant-Id`, `TenantGuard` + `RolesGuard`).
- **Phase 1:** content engine in `apps/core/src/content` — entries CRUD, **immutable versioning** (every save appends an `EntryVersion`; `currentVersion` = working copy, `publishedVersion` = live, they diverge after editing a published entry), **workflow** state machine (draft→in_review→approved→published→archived, transitions role-gated per `ACTION_ROLES`), and the **audit log** (every mutation, written in-transaction). Read-only content-types + audit endpoints. Verified end-to-end.

Next step is Phase 2 (admin UI: editor + workflow + media). Note: role-based *denial* paths are coded but not yet runtime-tested (needs the members feature to grant non-OWNER roles).

Run it: `pnpm install && pnpm db:up && pnpm --filter @govcms/schema build && pnpm db:generate && pnpm db:migrate && pnpm db:seed && pnpm --filter @govcms/core dev` → http://localhost:4001/api. Seeded login: `admin@govcms.local` / `changeme-now-please`.

Build note: keep `incremental` OFF in `apps/core/tsconfig.json` — combined with nest's `deleteOutDir` it silently skips emit (exits 0 with no `dist/`).

DB toolkit decided: **Prisma**. Note: `package.json#prisma` seed config is deprecated in Prisma 7 — migrate to `prisma.config.ts` when convenient.

Open decisions still pending (see plan §09): DB toolkit (leaning Prisma), **which ministry is the pilot**, **project name** (`govcms` is the working dir), auth approach.

Known dependency: the RISA guideline currently mandates TYPO3 as the CMS. Adoption requires RISA to revise that one clause — a governance step pursued alongside the pilot, not an engineering task.
