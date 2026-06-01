import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHead, CardTitle, Stat } from "@govcms/admin-ui";
import { api, type Status } from "../lib/api";

const ACTION_LABEL: Record<string, string> = {
  "entry.create": "created an entry",
  "entry.update": "edited an entry",
  "entry.submit": "submitted for review",
  "entry.approve": "approved an entry",
  "entry.request_changes": "requested changes",
  "entry.publish": "published an entry",
  "entry.archive": "archived an entry",
  "entry.restore_version": "restored a version",
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Dashboard() {
  const { data: entries } = useQuery({ queryKey: ["entries", {}], queryFn: () => api.entries() });
  const { data: audit } = useQuery({ queryKey: ["audit"], queryFn: () => api.audit(10) });

  const count = (s: Status) => entries?.filter((e) => e.status === s).length ?? 0;

  return (
    <>
      <div className="topbar">
        <div className="crumb">
          <b>Dashboard</b>
        </div>
      </div>
      <div className="scroll-area">
        <div className="page">
          <div className="page-head">
            <div>
              <h1 className="page-title">Overview</h1>
              <p className="page-sub">What needs attention across this workspace.</p>
            </div>
          </div>

          <div className="grid g4" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 22 }}>
            <Stat num={count("PUBLISHED")} label="Published" accent="var(--green)" />
            <Stat num={count("IN_REVIEW")} label="In review" accent="var(--amber)" />
            <Stat num={count("DRAFT")} label="Drafts" accent="var(--ink-4)" />
            <Stat num={count("APPROVED")} label="Approved" accent="var(--accent)" />
          </div>

          <Card>
            <CardHead>
              <CardTitle>Recent activity</CardTitle>
            </CardHead>
            <CardBody style={{ paddingTop: 12 }}>
              {!audit?.length && <p className="muted t13">No activity yet.</p>}
              {audit?.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center between"
                  style={{ padding: "9px 0", borderBottom: "1px solid var(--border-2)" }}
                >
                  <span className="t13">
                    Someone {ACTION_LABEL[a.action] ?? a.action}
                  </span>
                  <span className="muted t12 mono">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
