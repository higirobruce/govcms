-- Non-superuser application role so RLS actually applies at runtime.
-- Migrations + seed run as the owner (superuser); the app connects as this role.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'govcms_app') THEN
    CREATE ROLE govcms_app LOGIN PASSWORD 'govcms_app';
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO govcms_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO govcms_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO govcms_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO govcms_app;
-- The app role must NOT own the tables and must NOT be superuser/bypassrls,
-- so RLS policies apply to it. (It can't read _prisma_migrations — fine.)
