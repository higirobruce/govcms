import { z } from "zod";

/**
 * Shared contracts for govcms. These mirror the Prisma data model in
 * apps/core/prisma/schema.prisma and are the single source of truth for
 * validation shared between the Core API and the Admin UI.
 */

// ── Enums ────────────────────────────────────────────────────────────────

/** Per-tenant role. RBAC is always scoped to a tenant (see Membership). */
export const Role = z.enum(["OWNER", "ADMIN", "EDITOR", "REVIEWER", "VIEWER"]);
export type Role = z.infer<typeof Role>;

/** How a tenant is hosted. "Dedicated" is a deployment topology, not a fork. */
export const DeploymentMode = z.enum(["SHARED", "DEDICATED"]);
export type DeploymentMode = z.infer<typeof DeploymentMode>;

/** Editorial lifecycle of an entry. */
export const EntryStatus = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
]);
export type EntryStatus = z.infer<typeof EntryStatus>;

// ── Auth ─────────────────────────────────────────────────────────────────

export const RegisterInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  password: z.string().min(10, "Use at least 10 characters."),
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInput>;

// ── Tenant ───────────────────────────────────────────────────────────────

export const CreateTenantInput = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits and hyphens only."),
  locales: z.array(z.string()).min(1).default(["en", "rw"]),
  defaultLocale: z.string().default("en"),
  deploymentMode: DeploymentMode.default("SHARED"),
});
export type CreateTenantInput = z.infer<typeof CreateTenantInput>;

// ── Tenant context ─────────────────────────────────────────────────────────

/** Resolved per request from the X-Tenant-Id header (subdomain later). */
export const TENANT_HEADER = "x-tenant-id";

// ── Content ──────────────────────────────────────────────────────────────

/** A version payload — field values keyed by the content type's field keys.
 *  Field-level validation against ContentType.schema comes with the type builder. */
export const EntryData = z.record(z.unknown());
export type EntryData = z.infer<typeof EntryData>;

const slug = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase, digits and single hyphens.");

export const CreateEntryInput = z.object({
  contentTypeKey: z.string().min(1),
  locale: z.string().min(2).max(10),
  slug,
  data: EntryData.default({}),
});
export type CreateEntryInput = z.infer<typeof CreateEntryInput>;

export const UpdateEntryInput = z
  .object({
    slug: slug.optional(),
    data: EntryData.optional(),
  })
  .refine((v) => v.slug !== undefined || v.data !== undefined, {
    message: "Provide slug and/or data to update.",
  });
export type UpdateEntryInput = z.infer<typeof UpdateEntryInput>;

export const ListEntriesQuery = z.object({
  type: z.string().optional(),
  status: EntryStatus.optional(),
  locale: z.string().optional(),
});
export type ListEntriesQuery = z.infer<typeof ListEntriesQuery>;

/** Optional reviewer/editor note attached to a workflow transition. */
export const WorkflowNoteInput = z.object({
  note: z.string().max(2000).optional(),
});
export type WorkflowNoteInput = z.infer<typeof WorkflowNoteInput>;

/** Workflow actions and the transition each performs. The service validates
 *  the current state allows the action. */
export const WORKFLOW_TRANSITIONS = {
  submit: { from: ["DRAFT"], to: "IN_REVIEW" },
  approve: { from: ["IN_REVIEW"], to: "APPROVED" },
  request_changes: { from: ["IN_REVIEW", "APPROVED"], to: "DRAFT" },
  publish: { from: ["APPROVED"], to: "PUBLISHED" },
  archive: { from: ["PUBLISHED"], to: "ARCHIVED" },
  restore_to_draft: { from: ["ARCHIVED"], to: "DRAFT" },
} as const satisfies Record<string, { from: EntryStatus[]; to: EntryStatus }>;

export type WorkflowAction = keyof typeof WORKFLOW_TRANSITIONS;
