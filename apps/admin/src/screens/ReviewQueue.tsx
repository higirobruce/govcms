import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card } from "@govcms/admin-ui";
import { api, type WorkflowAction } from "../lib/api";

export function ReviewQueue() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: entries, isLoading } = useQuery({
    queryKey: ["entries", { status: "IN_REVIEW" }],
    queryFn: () => api.entries({ status: "IN_REVIEW" }),
  });

  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: WorkflowAction }) => api.transition(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries"] }),
  });

  return (
    <>
      <div className="topbar">
        <div className="crumb"><b>Review queue</b></div>
        <span className="grow" />
        {entries && <Badge status="review" dot>{entries.length} awaiting</Badge>}
      </div>
      <div className="scroll-area">
        <div className="page">
          {isLoading && <p className="muted">Loading…</p>}
          {entries?.length === 0 && (
            <div className="dash card-pad" style={{ borderRadius: "var(--r-md)", textAlign: "center", color: "var(--ink-3)" }}>
              Nothing awaiting review. 🎉
            </div>
          )}
          {entries?.map((e) => (
            <Card key={e.id} pad style={{ marginBottom: 12 }}>
              <div className="flex items-center between g4">
                <div style={{ minWidth: 0 }}>
                  <div className="fw6 truncate clickable" onClick={() => navigate(`/entry/${e.id}`)}>
                    {(e.currentVersion?.data?.title as string) || e.slug}
                  </div>
                  <div className="muted t12">
                    {e.contentType?.name} · {e.locale.toUpperCase()} · updated {new Date(e.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex g2 none">
                  <Button onClick={() => navigate(`/entry/${e.id}`)}>Open</Button>
                  <Button variant="danger" onClick={() => act.mutate({ id: e.id, action: "request_changes" })}>Request changes</Button>
                  <Button variant="success" onClick={() => act.mutate({ id: e.id, action: "approve" })}>Approve</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
