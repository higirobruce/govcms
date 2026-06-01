import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Field, Input, Logo } from "@govcms/admin-ui";
import { useSession } from "../lib/session";

export function Login() {
  const { login } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@govcms.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/workspaces");
    } catch {
      setError("Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh", background: "var(--bg)" }}>
      <Card pad style={{ width: 380 }}>
        <div style={{ marginBottom: 20 }}>
          <Logo size={30} />
        </div>
        <h1 className="serif" style={{ fontSize: "var(--t-24)", marginBottom: 4 }}>
          Sign in
        </h1>
        <p className="muted t13" style={{ marginBottom: 20 }}>
          Government content management.
        </p>
        <form onSubmit={submit}>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="pw">
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
          </Field>
          {error && (
            <div className="t13" style={{ color: "var(--red-ink)", marginBottom: 12 }}>
              {error}
            </div>
          )}
          <Button variant="primary" type="submit" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
