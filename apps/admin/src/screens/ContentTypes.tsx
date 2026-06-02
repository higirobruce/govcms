import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardBody, CardHead, CardTitle, Field, Input } from "@govcms/admin-ui";
import { api, FIELD_TYPES, type ContentType, type FieldDef, type FieldType } from "../lib/api";
import { Icon } from "../components/Icon";

const blankField = (): FieldDef => ({ key: "", label: "", type: "text", required: false });

export function ContentTypes() {
  const qc = useQueryClient();
  const { data: types } = useQuery({ queryKey: ["content-types"], queryFn: api.contentTypes });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const selected: ContentType | undefined = types?.find((t) => t.id === selectedId);
  useEffect(() => {
    if (selected) setFields(selected.schema?.fields ?? []);
  }, [selectedId, selected?.schema]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["content-types"] });

  const create = useMutation({
    mutationFn: () => api.createContentType({ key: newKey, name: newName, fields: [] }),
    onSuccess: (t) => { invalidate(); setNewKey(""); setNewName(""); setSelectedId(t.id); flash(`Created “${t.name}”.`); },
    onError: (e: Error) => flash(e.message),
  });
  const save = useMutation({
    mutationFn: () => api.updateContentType(selectedId!, { fields }),
    onSuccess: () => { invalidate(); flash("Fields saved."); },
    onError: (e: Error) => flash(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteContentType(id),
    onSuccess: () => { invalidate(); setSelectedId(null); flash("Type deleted."); },
    onError: (e: Error) => flash(e.message),
  });

  const setField = (i: number, patch: Partial<FieldDef>) =>
    setFields((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <>
      <div className="topbar"><div className="crumb"><b>Content types</b></div></div>
      <div className="scroll-area">
        <div className="page">
          <div className="page-head">
            <div>
              <h1 className="page-title">Content types</h1>
              <p className="page-sub">Define the kinds of content this site holds — and the fields each one has. No code.</p>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>
            {/* Left: type list + new */}
            <div className="grid g3">
              {types?.map((t) => (
                <Card key={t.id} pad className="clickable" onClick={() => setSelectedId(t.id)}
                  style={{ borderColor: t.id === selectedId ? "var(--accent)" : undefined }}>
                  <div className="flex between items-center">
                    <div>
                      <div className="fw6">{t.name}</div>
                      <div className="muted t12 mono">{t.key} · {t.schema?.fields?.length ?? 0} fields</div>
                    </div>
                    <Icon name="right" size={16} />
                  </div>
                </Card>
              ))}
              <Card pad style={{ background: "var(--surface-2)" }}>
                <div className="section-label" style={{ marginBottom: 10 }}>New type</div>
                <Field label="Key" htmlFor="k" hint="lowercase, e.g. tender"><Input id="k" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="tender" /></Field>
                <Field label="Name" htmlFor="n"><Input id="n" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tender" /></Field>
                <Button variant="primary" style={{ width: "100%" }} disabled={!newKey || !newName || create.isPending} onClick={() => create.mutate()}>
                  <Icon name="plus" size={16} className="bic" /> Create type
                </Button>
              </Card>
            </div>

            {/* Right: field editor */}
            <Card>
              {!selected ? (
                <CardBody><p className="muted">Select a type on the left, or create one, to edit its fields.</p></CardBody>
              ) : (
                <>
                  <CardHead>
                    <CardTitle>{selected.name} <span className="muted mono t12">· {selected.key}</span></CardTitle>
                    <div className="flex g2">
                      <Button variant="danger" size="sm" onClick={() => del.mutate(selected.id)}>Delete type</Button>
                      <Button variant="primary" size="sm" disabled={save.isPending} onClick={() => save.mutate()}>Save fields</Button>
                    </div>
                  </CardHead>
                  <CardBody>
                    <table className="table">
                      <thead><tr><th>Key</th><th>Label</th><th>Type</th><th>Required</th><th>Options</th><th></th></tr></thead>
                      <tbody>
                        {fields.map((f, i) => (
                          <tr key={i}>
                            <td><Input value={f.key} onChange={(e) => setField(i, { key: e.target.value })} placeholder="closing_date" style={{ height: 32 }} /></td>
                            <td><Input value={f.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="Closing date" style={{ height: 32 }} /></td>
                            <td>
                              <select className="input" style={{ height: 32, width: 120 }} value={f.type} onChange={(e) => setField(i, { type: e.target.value as FieldType })}>
                                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </td>
                            <td><input type="checkbox" checked={!!f.required} onChange={(e) => setField(i, { required: e.target.checked })} /></td>
                            <td>{f.type === "select"
                              ? <Input value={(f.options ?? []).join(", ")} onChange={(e) => setField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="A, B, C" style={{ height: 32 }} />
                              : <span className="faint t12">—</span>}</td>
                            <td><button className="row-menu" onClick={() => setFields((x) => x.filter((_, j) => j !== i))} title="Remove"><Icon name="x" size={15} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Button variant="ghost" size="sm" onClick={() => setFields((f) => [...f, blankField()])} style={{ marginTop: 10 }}>
                      <Icon name="plus" size={15} className="bic" /> Add field
                    </Button>
                  </CardBody>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {toast && <div className="toast-wrap"><div className="toast"><span className="tdot" style={{ background: "var(--accent-2)" }} />{toast}</div></div>}
    </>
  );
}
