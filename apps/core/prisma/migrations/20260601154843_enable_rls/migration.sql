-- ============================================================================
-- govcms — Row-Level Security (the DB-layer half of tenant isolation).
-- DRAFT / NOT auto-applied. See ./README.md before enabling.
--
-- The app layer (TenantGuard + every query filtered by tenantId) is the first
-- line of defense. RLS is defense-in-depth: even a bug or a raw query cannot
-- read across tenants. FORCE ROW LEVEL SECURITY makes it apply to the table
-- owner too (we connect as the owner).
--
-- Requires the app to set, per request/transaction:
--   SELECT set_config('app.tenant_id', '<id>', true);
--   SELECT set_config('app.user_id',   '<id>', true);
-- current_setting(..., true) returns NULL when unset → policies fail CLOSED.
-- ============================================================================

-- Tenant-scoped tables that carry tenant_id directly.
ALTER TABLE "Membership"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership"  FORCE  ROW LEVEL SECURITY;
ALTER TABLE "ContentType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContentType" FORCE  ROW LEVEL SECURITY;
ALTER TABLE "Entry"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entry"       FORCE  ROW LEVEL SECURITY;
ALTER TABLE "Media"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Media"       FORCE  ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"    FORCE  ROW LEVEL SECURITY;

-- Membership is special: the workspace picker lists a user's memberships ACROSS
-- tenants, so allow rows matching the current user OR the current tenant.
CREATE POLICY membership_isolation ON "Membership"
  USING (
    "tenantId" = current_setting('app.tenant_id', true)
    OR "userId" = current_setting('app.user_id', true)
  );

CREATE POLICY contenttype_isolation ON "ContentType"
  USING ("tenantId" = current_setting('app.tenant_id', true));
CREATE POLICY entry_isolation ON "Entry"
  USING ("tenantId" = current_setting('app.tenant_id', true));
CREATE POLICY media_isolation ON "Media"
  USING ("tenantId" = current_setting('app.tenant_id', true));
CREATE POLICY audit_isolation ON "AuditLog"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- EntryVersion / WorkflowState have no tenant_id; scope them transitively via
-- Entry (whose own RLS already restricts to the current tenant).
ALTER TABLE "EntryVersion"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EntryVersion"  FORCE  ROW LEVEL SECURITY;
ALTER TABLE "WorkflowState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowState" FORCE  ROW LEVEL SECURITY;

CREATE POLICY entryversion_isolation ON "EntryVersion"
  USING ("entryId" IN (SELECT "id" FROM "Entry"));
CREATE POLICY workflowstate_isolation ON "WorkflowState"
  USING ("entryId" IN (SELECT "id" FROM "Entry"));

-- NOTE: "User" and "Tenant" intentionally have NO RLS — User is global (login),
-- Tenant is resolved by id/slug (admin tenant switch + public site by slug).
