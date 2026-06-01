import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Logo } from "@govcms/admin-ui";
import { api, type Tenant } from "../lib/api";
import { useSession } from "../lib/session";
import { Icon } from "./Icon";

const NAV_CONTENT = [
  { to: "/content/page", label: "Pages", icon: "pages" },
  { to: "/content/news", label: "News", icon: "news" },
  { to: "/content/service", label: "Services", icon: "services" },
  { to: "/content/media", label: "Media", icon: "media" },
];
const NAV_MANAGE = [
  { to: "/review", label: "Review queue", icon: "review" },
  { to: "/content/types", label: "Content types", icon: "types" },
  { to: "/members", label: "Members", icon: "members" },
];

function navClass({ isActive }: { isActive: boolean }) {
  return "nav-item" + (isActive ? " active" : "");
}

export function AppShell() {
  const { user, tenantId, logout, selectTenant } = useSession();
  const navigate = useNavigate();
  const { data: tenants } = useQuery({ queryKey: ["tenants"], queryFn: api.tenants });
  const current: Tenant | undefined = tenants?.find((t) => t.id === tenantId);

  const crest = (current?.name ?? "??")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app">
      <aside className="sidebar">
        <Logo size={28} />

        <button
          className="ws-switch"
          onClick={() => {
            selectTenant(""); // clear → router sends to /workspaces
            navigate("/workspaces");
          }}
          title="Switch workspace"
        >
          <span className="crest">{crest}</span>
          <span className="meta">
            <div className="nm">{current?.name ?? "Select workspace"}</div>
            <div className="rl">{current?.role ?? ""}</div>
          </span>
          <Icon name="caret" size={16} className="car" />
        </button>

        <NavLink to="/dashboard" className={navClass}>
          <Icon name="dashboard" size={17} className="nic" />
          Dashboard
        </NavLink>

        <div className="nav-group">
          <div className="nav-label">Content</div>
          {NAV_CONTENT.map((n) => (
            <NavLink key={n.to} to={n.to} className={navClass}>
              <Icon name={n.icon} size={17} className="nic" />
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-label">Manage</div>
          {NAV_MANAGE.map((n) => (
            <NavLink key={n.to} to={n.to} className={navClass}>
              <Icon name={n.icon} size={17} className="nic" />
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="spacer" />
        <button className="user-chip" onClick={logout} title="Sign out" style={{ border: 0, background: "none", textAlign: "left", borderTop: "1px solid var(--sidebar-border)" }}>
          <Avatar name={user?.name ?? ""} size={30} />
          <span className="meta">
            <div className="nm">{user?.name}</div>
            <div className="em">{user?.email}</div>
          </span>
          <Icon name="caret" size={16} className="car" />
        </button>
      </aside>

      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
