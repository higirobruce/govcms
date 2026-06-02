import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Card, CardBody, CardHead, CardTitle, Field, Input } from "@govcms/admin-ui";
import { api, ROLES, type Role } from "../lib/api";
import { Icon } from "../components/Icon";

export function Members() {
  const qc = useQueryClient();
  const { data: members, isLoading } = useQuery({ queryKey: ["members"], queryFn: api.members });

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string, ms = 6000) => { setToast(m); setTimeout(() => setToast(null), ms); };

  const invalidate = () => qc.invalidateQueries({ queryKey: ["members"] });

  const add = useMutation({
    mutationFn: () => api.addMember({ email, name: name || undefined, role }),
    onSuccess: (r) => {
      invalidate();
      setEmail(""); setName("");
      flash(
        r.tempPassword
          ? `Added. Temporary password for ${r.membership.user.email}: ${r.tempPassword}`
          : `Added ${r.membership.user.email}.`,
      );
    },
    onError: (e: Error) => flash(e.message),
  });
  const setRoleM = useMutation({
    mutationFn: (v: { userId: string; role: Role }) => api.setMemberRole(v.userId, v.role),
    onSuccess: invalidate,
    onError: (e: Error) => flash(e.message),
  });
  const remove = useMutation({
    mutationFn: (userId: string) => api.removeMember(userId),
    onSuccess: invalidate,
    onError: (e: Error) => flash(e.message),
  });

  return (
    <>
      <div className="topbar">
        <div className="crumb"><b>Members</b></div>
      </div>
      <div className="scroll-area">
        <div className="page" style={{ maxWidth: 920 }}>
          <div className="page-head">
            <div>
              <h1 className="page-title">Members &amp; roles</h1>
              <p className="page-sub">Who can do what in this workspace. Roles are per-workspace.</p>
            </div>
          </div>

          <Card style={{ marginBottom: 20 }}>
            <CardHead><CardTitle>Invite a member</CardTitle></CardHead>
            <CardBody>
              <div className="flex g3 wrap items-end">
                <Field label="Email" htmlFor="em" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
                  <Input id="em" type="email" value={email} placeholder="name@ministry.gov.rw" onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Name" optional htmlFor="nm" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
                  <Input id="nm" value={name} placeholder="Full name" onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Role" htmlFor="rl" style={{ marginBottom: 0 }}>
                  <select id="rl" className="input" value={role} onChange={(e) => setRole(e.target.value as Role)} style={{ width: 140 }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
                <Button variant="primary" disabled={!email || add.isPending} onClick={() => add.mutate()}>
                  <Icon name="plus" size={16} className="bic" /> Invite
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <table className="table">
              <thead>
                <tr><th>Member</th><th>Email</th><th>Role</th><th></th></tr>
              </thead>
              <tbody>
                {members?.map((m) => (
                  <tr key={m.userId}>
                    <td>
                      <span className="flex items-center g3">
                        <Avatar name={m.user.name} size={28} />
                        <span className="fw6">{m.user.name}</span>
                      </span>
                    </td>
                    <td className="muted">{m.user.email}</td>
                    <td>
                      <select
                        className="input"
                        style={{ width: 140, height: 34 }}
                        value={m.role}
                        onChange={(e) => setRoleM.mutate({ userId: m.userId, role: e.target.value as Role })}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button variant="danger" size="sm" onClick={() => remove.mutate(m.userId)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="card-pad muted t13">Loading…</div>}
          </Card>
        </div>
      </div>

      {toast && (
        <div className="toast-wrap"><div className="toast"><span className="tdot" style={{ background: "var(--accent-2)" }} />{toast}</div></div>
      )}
    </>
  );
}
