// Thin typed client for the govcms Core API. Injects the JWT and the active
// tenant (X-Tenant-Id) on every request.

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4001/api";
/** Origin that serves uploaded media (the core, without the /api prefix). */
const MEDIA_ORIGIN = BASE.replace(/\/api\/?$/, "");
export const mediaUrl = (path: string) => `${MEDIA_ORIGIN}${path}`;

const TOKEN_KEY = "govcms.token";
const TENANT_KEY = "govcms.tenant";

let token: string | null = localStorage.getItem(TOKEN_KEY);
let tenantId: string | null = localStorage.getItem(TENANT_KEY);

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function setTenantId(id: string | null) {
  tenantId = id;
  if (id) localStorage.setItem(TENANT_KEY, id);
  else localStorage.removeItem(TENANT_KEY);
}
export const getToken = () => token;
export const getTenantId = () => tenantId;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: { tenant?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (opts.tenant !== false && tenantId) headers["x-tenant-id"] = tenantId;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(res.status, e.message ?? res.statusText, e);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ── Types (light mirrors of the Prisma models) ────────────────────────────
export type Status = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  memberships?: { tenantId: string; role: Role; tenant: { id: string; name: string; slug: string } }[];
}
export type Role = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "VIEWER";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  locales: string[];
  defaultLocale: string;
  deploymentMode: string;
  role: Role;
}
export interface Version {
  id: string;
  data: Record<string, unknown>;
  authorId: string;
  createdAt: string;
  author?: { id: string; name: string };
}
export interface Entry {
  id: string;
  tenantId: string;
  contentTypeId: string;
  locale: string;
  slug: string;
  status: Status;
  currentVersionId?: string;
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
  currentVersion?: Version | null;
  contentType?: { key: string; name: string };
}
export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "image";
export const FIELD_TYPES: FieldType[] = [
  "text",
  "textarea",
  "richtext",
  "number",
  "date",
  "boolean",
  "select",
  "image",
];
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}
export interface ContentType {
  id: string;
  key: string;
  name: string;
  schema?: { fields: FieldDef[] };
}
export interface Media {
  id: string;
  tenantId: string;
  path: string;
  mimeType: string;
  altText: Record<string, string>;
  meta?: { size?: number; name?: string };
  createdAt: string;
}
export interface Member {
  userId: string;
  tenantId: string;
  role: Role;
  user: { id: string; name: string; email: string };
}
export interface AuditEntry {
  id: string;
  action: string;
  target: string;
  actorId: string;
  createdAt: string;
  after?: Record<string, unknown> | null;
}

export type WorkflowAction =
  | "submit"
  | "approve"
  | "request_changes"
  | "publish"
  | "archive"
  | "restore_to_draft";

export const api = {
  login: (email: string, password: string) =>
    req<{ token: string; user: AuthUser }>("POST", "/auth/login", { email, password }, { tenant: false }),
  me: () => req<AuthUser>("GET", "/auth/me", undefined, { tenant: false }),
  tenants: () => req<Tenant[]>("GET", "/tenants", undefined, { tenant: false }),

  contentTypes: () => req<ContentType[]>("GET", "/content-types"),
  createContentType: (input: { key: string; name: string; fields: FieldDef[] }) =>
    req<ContentType>("POST", "/content-types", input),
  updateContentType: (id: string, input: { name?: string; fields?: FieldDef[] }) =>
    req<ContentType>("PATCH", `/content-types/${id}`, input),
  deleteContentType: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/content-types/${id}`),
  entries: (q: { type?: string; status?: Status } = {}) => {
    const p = new URLSearchParams();
    if (q.type) p.set("type", q.type);
    if (q.status) p.set("status", q.status);
    const qs = p.toString();
    return req<Entry[]>("GET", `/entries${qs ? `?${qs}` : ""}`);
  },
  entry: (id: string) => req<Entry>("GET", `/entries/${id}`),
  createEntry: (input: { contentTypeKey: string; locale: string; slug: string; data: Record<string, unknown> }) =>
    req<Entry>("POST", "/entries", input),
  updateEntry: (id: string, input: { slug?: string; data?: Record<string, unknown> }) =>
    req<Entry>("PATCH", `/entries/${id}`, input),
  versions: (id: string) => req<Version[]>("GET", `/entries/${id}/versions`),
  restore: (id: string, versionId: string) =>
    req<Entry>("POST", `/entries/${id}/versions/${versionId}/restore`),
  transition: (id: string, action: WorkflowAction, note?: string) =>
    req<Entry>("POST", `/entries/${id}/${action}`, { note }),
  audit: (limit = 12) => req<AuditEntry[]>("GET", `/audit?limit=${limit}`),

  media: () => req<Media[]>("GET", "/media"),
  uploadMedia: async (file: File): Promise<Media> => {
    const fd = new FormData();
    fd.append("file", file);
    const headers: Record<string, string> = {};
    if (token) headers.authorization = `Bearer ${token}`;
    if (tenantId) headers["x-tenant-id"] = tenantId;
    const res = await fetch(`${BASE}/media`, { method: "POST", headers, body: fd });
    if (!res.ok) {
      const e = (await res.json().catch(() => ({}))) as { message?: string };
      throw new ApiError(res.status, e.message ?? res.statusText, e);
    }
    return res.json() as Promise<Media>;
  },
  setMediaAlt: (id: string, alt: Record<string, string>) =>
    req<Media>("PATCH", `/media/${id}`, { alt }),
  deleteMedia: (id: string) => req<{ ok: boolean }>("DELETE", `/media/${id}`),

  members: () => req<Member[]>("GET", "/members"),
  addMember: (input: { email: string; name?: string; role: Role }) =>
    req<{ membership: Member; tempPassword?: string }>("POST", "/members", input),
  setMemberRole: (userId: string, role: Role) =>
    req<Member>("PATCH", `/members/${userId}`, { role }),
  removeMember: (userId: string) => req<{ ok: boolean }>("DELETE", `/members/${userId}`),
};

export const ROLES: Role[] = ["OWNER", "ADMIN", "EDITOR", "REVIEWER", "VIEWER"];
