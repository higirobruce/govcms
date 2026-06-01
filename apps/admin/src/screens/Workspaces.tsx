import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Logo } from "@govcms/admin-ui";
import { api, type Tenant } from "../lib/api";
import { useSession } from "../lib/session";

export function Workspaces() {
  const { selectTenant, logout } = useSession();
  const navigate = useNavigate();
  const { data: tenants, isLoading } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });

  function open(t: Tenant) {
    selectTenant(t.id);
    navigate("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="topbar">
        <Logo size={28} />
        <span className="grow" />
        <button className="btn btn-sm btn-ghost" onClick={logout}>
          Sign out
        </button>
      </div>
      <div style={{ maxWidth: 680, margin: "40px auto", padding: "0 20px" }}>
        <h1 className="serif page-title" style={{ marginBottom: 4 }}>
          Choose a workspace
        </h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Pick the ministry site you want to work in.
        </p>

        {isLoading && <p className="muted">Loading…</p>}

        <div className="grid g3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {tenants?.map((t) => {
            const crest = t.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            return (
              <Card key={t.id} pad className="clickable" onClick={() => open(t)}>
                <div className="flex items-center g3">
                  <span className="ws-switch" style={{ margin: 0, padding: 0, border: 0, background: "none" }}>
                    <span className="crest" style={{ width: 40, height: 40 }}>
                      {crest}
                    </span>
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw6 truncate">{t.name}</div>
                    <div className="muted t12 mono">
                      {t.role} · {t.locales.join(" · ")}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {tenants && tenants.length === 0 && (
            <p className="muted">No workspaces yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
