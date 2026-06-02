import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, Input } from "@govcms/admin-ui";
import { api, mediaUrl, type Media as MediaItem } from "../lib/api";
import { Icon } from "../components/Icon";

export function Media() {
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery({ queryKey: ["media"], queryFn: api.media });
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const invalidate = () => qc.invalidateQueries({ queryKey: ["media"] });

  const upload = useMutation({
    mutationFn: (file: File) => api.uploadMedia(file),
    onSuccess: invalidate,
    onError: (e: Error) => flash(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteMedia(id),
    onSuccess: invalidate,
    onError: (e: Error) => flash(e.message),
  });

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => upload.mutate(f));
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <div className="topbar">
        <div className="crumb"><b>Media</b></div>
        <span className="grow" />
        <input ref={fileRef} type="file" hidden multiple onChange={onPick} accept="image/*,application/pdf" />
        <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
          <Icon name="plus" size={16} className="bic" /> {upload.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <div className="scroll-area">
        <div className="page">
          <div className="page-head">
            <div>
              <h1 className="page-title">Media library</h1>
              <p className="page-sub">Images and files. Alt text is required before content using an image can publish.</p>
            </div>
          </div>

          {isLoading && <p className="muted">Loading…</p>}
          {items && items.length === 0 && (
            <Card pad className="dash" style={{ textAlign: "center", color: "var(--ink-3)" }}>
              No media yet. Use “Upload” to add images or PDFs.
            </Card>
          )}

          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {items?.map((m) => <MediaCard key={m.id} m={m} onDelete={() => del.mutate(m.id)} onSaved={() => { invalidate(); flash("Alt text saved"); }} />)}
          </div>
        </div>
      </div>
      {toast && <div className="toast-wrap"><div className="toast"><span className="tdot" style={{ background: "var(--accent-2)" }} />{toast}</div></div>}
    </>
  );
}

function MediaCard({ m, onDelete, onSaved }: { m: MediaItem; onDelete: () => void; onSaved: () => void }) {
  const isImage = m.mimeType.startsWith("image/");
  const ext = (m.meta?.name?.split(".").pop() ?? m.mimeType.split("/").pop() ?? "file").toUpperCase();
  const [alt, setAlt] = useState(m.altText?.en ?? "");
  const save = useMutation({ mutationFn: () => api.setMediaAlt(m.id, { en: alt }), onSuccess: onSaved });
  const hasAlt = (m.altText?.en ?? "").trim().length > 0;

  return (
    <Card pad>
      <div style={{ aspectRatio: "16 / 10", borderRadius: "var(--r-sm)", overflow: "hidden", background: "var(--surface-3)", display: "grid", placeItems: "center", marginBottom: 12 }}>
        {isImage ? (
          <img src={mediaUrl(m.path)} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className="mono t12" style={{ color: "var(--ink-3)" }}>{ext}</span>
        )}
      </div>
      <div className="flex between items-center" style={{ marginBottom: 8 }}>
        <span className="t13 truncate" style={{ maxWidth: 160 }}>{m.meta?.name ?? m.path.split("/").pop()}</span>
        {isImage && (hasAlt ? <Badge status="published">alt ✓</Badge> : <Badge status="review">alt missing</Badge>)}
      </div>
      {isImage && (
        <div className="flex g2 items-center" style={{ marginBottom: 8 }}>
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (English)" style={{ height: 32 }} />
          <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>Save</Button>
        </div>
      )}
      <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
    </Card>
  );
}
