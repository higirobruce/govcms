import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Field,
  Input,
  Seg,
  Textarea,
} from "@govcms/admin-ui";
import { api, type Status, type WorkflowAction } from "../lib/api";
import { Icon } from "../components/Icon";

const STEP: Record<Status, number> = { DRAFT: 0, IN_REVIEW: 1, APPROVED: 2, PUBLISHED: 3, ARCHIVED: 0 };
const STEPS = ["Draft", "In review", "Approved", "Published"];
const BADGE: Record<Status, "draft" | "review" | "approved" | "published" | "changes"> = {
  DRAFT: "draft", IN_REVIEW: "review", APPROVED: "approved", PUBLISHED: "published", ARCHIVED: "draft",
};

function StatusTimeline({ status }: { status: Status }) {
  const idx = STEP[status];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {STEPS.map((label, i) => {
        const done = i < idx, on = i === idx;
        return (
          <div key={label} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", flex: "none", marginTop: 2,
                background: on ? "var(--accent)" : done ? "var(--green)" : "var(--surface)",
                border: "2px solid " + (on ? "var(--accent)" : done ? "var(--green)" : "var(--border-strong)"),
                boxShadow: on ? "0 0 0 3px var(--accent-ring)" : "none" }} />
              {i < STEPS.length - 1 && (
                <span style={{ width: 2, flex: 1, minHeight: 16, background: done ? "var(--green)" : "var(--border)", margin: "2px 0" }} />
              )}
            </div>
            <div style={{ paddingBottom: 14 }}>
              <div style={{ fontSize: "var(--t-13)", fontWeight: on ? 700 : 600, color: on || done ? "var(--ink)" : "var(--ink-4)" }}>{label}</div>
              {on && <div className="muted t12">Current state</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Editor() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: entry } = useQuery({ queryKey: ["entry", id], queryFn: () => api.entry(id) });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!entry) return;
    const d = entry.currentVersion?.data ?? {};
    setTitle((d.title as string) ?? "");
    setSlug(entry.slug);
    setSummary((d.summary as string) ?? "");
    setBody((d.body as string) ?? "");
    setDirty(false);
  }, [entry?.id, entry?.currentVersionId]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const save = useMutation({
    mutationFn: () => api.updateEntry(id, { slug, data: { title, summary, body } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entry", id] });
      qc.invalidateQueries({ queryKey: ["entries"] });
      setDirty(false);
      flash("Saved — new version created");
    },
  });

  const transition = useMutation({
    mutationFn: (action: WorkflowAction) => api.transition(id, action),
    onSuccess: (_d, action) => {
      qc.invalidateQueries({ queryKey: ["entry", id] });
      qc.invalidateQueries({ queryKey: ["entries"] });
      flash(`Done: ${action.replace(/_/g, " ")}`);
    },
    onError: (e: Error) => flash(e.message),
  });

  if (!entry) {
    return <div className="scroll-area"><div className="page muted">Loading…</div></div>;
  }

  const status = entry.status;
  const titleOk = title.trim().length > 0;
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  const actions = (
    <>
      {status === "DRAFT" && <Button variant="primary" onClick={() => transition.mutate("submit")}>Submit for review</Button>}
      {status === "IN_REVIEW" && <>
        <Button variant="danger" onClick={() => transition.mutate("request_changes")}>Request changes</Button>
        <Button variant="success" onClick={() => transition.mutate("approve")}>Approve</Button>
      </>}
      {status === "APPROVED" && <>
        <Button variant="ghost" onClick={() => transition.mutate("request_changes")}>Request changes</Button>
        <Button variant="primary" onClick={() => transition.mutate("publish")}>Publish</Button>
      </>}
      {status === "PUBLISHED" && <Button onClick={() => transition.mutate("archive")}>Archive</Button>}
      {status === "ARCHIVED" && <Button onClick={() => transition.mutate("restore_to_draft")}>Restore to draft</Button>}
    </>
  );

  return (
    <>
      <div className="topbar">
        <div className="crumb" style={{ maxWidth: "40%" }}>
          <button className="x-btn" onClick={() => navigate(-1)} title="Back"><Icon name="back" size={16} /></button>
          <span>{entry.contentType?.name}</span>
          <span className="sep">/</span>
          <b className="truncate">{title || entry.slug}</b>
        </div>
        <span className="grow" />
        <Seg options={["EN", "RW", "FR"]} value={entry.locale.toUpperCase()} onChange={() => flash("Locale switching is per-entry — coming with translations UI")} />
        <Badge status={BADGE[status]} dot />
        <Button onClick={() => save.mutate()} disabled={!dirty || save.isPending}>{save.isPending ? "Saving…" : "Save draft"}</Button>
        {actions}
      </div>

      <div className="scroll-area">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px" }}>
          <div style={{ padding: "24px 26px", borderRight: "1px solid var(--border)", minWidth: 0 }}>
            <Field label="Title" required htmlFor="t">
              <Input id="t" value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} style={{ height: 44, fontSize: "var(--t-16)" }} />
            </Field>
            <Field label="Slug" htmlFor="s" hint={slugOk ? undefined : "Lowercase letters, digits and single hyphens."}>
              <Input id="s" value={slug} onChange={(e) => { setSlug(e.target.value); setDirty(true); }} />
            </Field>
            <Field label="Summary" optional htmlFor="su">
              <Textarea id="su" value={summary} onChange={(e) => { setSummary(e.target.value); setDirty(true); }} style={{ minHeight: 70 }} />
            </Field>
            <Field label="Body" htmlFor="b">
              <Textarea id="b" value={body} onChange={(e) => { setBody(e.target.value); setDirty(true); }} style={{ minHeight: 220 }} placeholder="Write the page content…" />
            </Field>
          </div>

          <div style={{ padding: 18, background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 10 }}>Status</div>
              <StatusTimeline status={status} />
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Checks before publish</div>
              <div className="t13" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <Check ok={titleOk} label="Title set" />
                <Check ok={slugOk} label="Slug valid" />
                <Check ok label="Contrast AA" />
              </div>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Details</div>
              <div className="muted t13" style={{ lineHeight: 1.9 }}>
                Updated · {new Date(entry.updatedAt).toLocaleString()}<br />
                Working version · {entry.currentVersionId?.slice(-6)}<br />
                Live version · {entry.publishedVersionId ? entry.publishedVersionId.slice(-6) : "—"}
              </div>
              <Button size="sm" onClick={() => setShowHistory(true)} style={{ width: "100%", marginTop: 10 }}>View history</Button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && <HistoryDrawer id={id} onClose={() => setShowHistory(false)} onRestored={() => { qc.invalidateQueries({ queryKey: ["entry", id] }); flash("Restored a version"); }} />}

      {toast && (
        <div className="toast-wrap"><div className="toast"><span className="tdot" style={{ background: "var(--green)" }} />{toast}</div></div>
      )}
    </>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 7, color: ok ? "var(--ink-2)" : "var(--amber-ink)" }}>
      <Icon name={ok ? "check" : "x"} size={14} />
      {label}
    </span>
  );
}

function HistoryDrawer({ id, onClose, onRestored }: { id: string; onClose: () => void; onRestored: () => void }) {
  const { data: versions } = useQuery({ queryKey: ["versions", id], queryFn: () => api.versions(id) });
  const restore = useMutation({
    mutationFn: (versionId: string) => api.restore(id, versionId),
    onSuccess: () => { onRestored(); onClose(); },
  });
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3 className="serif" style={{ fontSize: "var(--t-18)" }}>Version history</h3>
          <button className="x-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="scroll-area" style={{ padding: 22 }}>
          {versions?.map((v, i) => (
            <div key={v.id} className="flex items-center between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border-2)" }}>
              <div>
                <div className="fw6 t13">Version #{versions.length - i} {i === 0 && <span className="muted">· current</span>}</div>
                <div className="muted t12">{v.author?.name ?? "—"} · {new Date(v.createdAt).toLocaleString()}</div>
              </div>
              {i !== 0 && <Button size="sm" onClick={() => restore.mutate(v.id)} disabled={restore.isPending}>Restore</Button>}
            </div>
          ))}
          {!versions?.length && <p className="muted t13">No versions.</p>}
        </div>
      </div>
    </div>
  );
}
