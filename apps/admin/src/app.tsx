import { Navigate, Route, Routes } from "react-router-dom";
import { useSession } from "./lib/session";
import { AppShell } from "./components/AppShell";
import { Login } from "./screens/Login";
import { Workspaces } from "./screens/Workspaces";
import { Dashboard } from "./screens/Dashboard";
import { ContentList } from "./screens/ContentList";
import { Editor } from "./screens/Editor";
import { ReviewQueue } from "./screens/ReviewQueue";

export function App() {
  const { ready, user, tenantId } = useSession();

  if (!ready) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <span className="muted">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated but no workspace chosen yet.
  if (!tenantId) {
    return (
      <Routes>
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="*" element={<Navigate to="/workspaces" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/workspaces" element={<Workspaces />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/content/:type" element={<ContentList />} />
        <Route path="/entry/:id" element={<Editor />} />
        <Route path="/review" element={<ReviewQueue />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
