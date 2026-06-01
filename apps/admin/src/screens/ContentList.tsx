import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card } from "@govcms/admin-ui";
import { api, type Entry, type Status } from "../lib/api";
import { Icon } from "../components/Icon";

const TITLES: Record<string, string> = { page: "Pages", news: "News", service: "Services" };
const STATUS_BADGE: Record<Status, "draft" | "review" | "approved" | "published" | "changes"> = {
  DRAFT: "draft",
  IN_REVIEW: "review",
  APPROVED: "approved",
  PUBLISHED: "published",
  ARCHIVED: "draft",
};
const FILTERS: { label: string; value: Status | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "In review", value: "IN_REVIEW" },
  { label: "Draft", value: "DRAFT" },
];

export function ContentList() {
  const { type = "page" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "ALL">("ALL");

  if (type === "media" || type === "types") {
    return (
      <>
        <div className="topbar"><div className="crumb"><b>{type === "media" ? "Media" : "Content types"}</b></div></div>
        <div className="scroll-area"><div className="page">
          <div className="dash card-pad" style={{ borderRadius: "var(--r-md)", textAlign: "center", color: "var(--ink-3)" }}>
            {type === "media" ? "Media library" : "Content-type builder"} — coming in a later phase.
          </div>
        </div></div>
      </>
    );
  }

  const { data: entries, isLoading } = useQuery({
    queryKey: ["entries", { type }],
    queryFn: () => api.entries({ type }),
  });

  const create = useMutation({
    mutationFn: () =>
      api.createEntry({
        contentTypeKey: type,
        locale: "en",
        slug: `untitled-${Date.now().toString(36)}`,
        data: { title: "Untitled", summary: "", body: "" },
      }),
    onSuccess: (e: Entry) => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      navigate(`/entry/${e.id}`);
    },
  });

  const rows = (entries ?? []).filter((e) => filter === "ALL" || e.status === filter);

  return (
    <>
      <div className="topbar">
        <div className="crumb"><b>{TITLES[type] ?? type}</b></div>
        <span className="grow" />
        <Button variant="primary" onClick={() => create.mutate()} disabled={create.isPending}>
          <Icon name="plus" size={16} className="bic" />
          New {type}
        </Button>
      </div>
      <div className="scroll-area">
        <div className="page">
          <div className="tabs" style={{ marginBottom: 16 }}>
            {FILTERS.map((f) => (
              <button key={f.value} className={filter === f.value ? "on" : ""} onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>

          <Card>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Locale</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="t-title" onClick={() => navigate(`/entry/${e.id}`)}>
                      {(e.currentVersion?.data?.title as string) || e.slug}
                    </td>
                    <td><Badge status={STATUS_BADGE[e.status]} dot /></td>
                    <td className="muted">{e.locale.toUpperCase()}</td>
                    <td className="muted t13">{new Date(e.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="card-pad muted t13">Loading…</div>}
            {!isLoading && rows.length === 0 && (
              <div className="card-pad muted t13">No entries yet. Create one with “New {type}”.</div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
