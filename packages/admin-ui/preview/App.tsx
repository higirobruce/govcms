import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHead,
  CardTitle,
  Field,
  Input,
  Logo,
  Seg,
  Stat,
  Textarea,
} from "../src";

type Theme = "light" | "dark";
type Density = "comfortable" | "compact";
type Sidebar = "light" | "deep";

const ACCENTS: Record<string, { accent: string; strong: string; soft: string; ink: string }> = {
  "Sky blue": { accent: "#0E72B8", strong: "#0A567F", soft: "#E8F2FB", ink: "#0B4E7E" },
  Green: { accent: "#1E9E57", strong: "#157A43", soft: "#E5F5EC", ink: "#136540" },
  Plum: { accent: "#7A5AC9", strong: "#5E45A0", soft: "#F0EBFA", ink: "#4A3382" },
  Terracotta: { accent: "#C26A2B", strong: "#9E5420", soft: "#FBEEE2", ink: "#7E441A" },
};

export function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [sidebar, setSidebar] = useState<Sidebar>("light");
  const [accent, setAccent] = useState("Sky blue");
  const [locale, setLocale] = useState("EN");

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = theme === "dark" ? "dark" : "";
    r.dataset.density = density === "compact" ? "compact" : "";
    r.dataset.sidebar = sidebar === "deep" ? "deep" : "";
    const a = ACCENTS[accent];
    r.style.setProperty("--accent", a.accent);
    r.style.setProperty("--accent-strong", a.strong);
    r.style.setProperty("--accent-soft", a.soft);
    r.style.setProperty("--accent-ink", a.ink);
  }, [theme, density, sidebar, accent]);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Topbar with brand + tweaks */}
      <header className="topbar" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <Logo size={28} />
        <Badge status="approved" className="mono">
          design system
        </Badge>
        <span className="grow" />
        <div className="flex items-center g3 wrap">
          <Seg
            options={Object.keys(ACCENTS)}
            value={accent}
            onChange={setAccent}
          />
          <Seg
            options={["comfortable", "compact"]}
            value={density}
            onChange={(v) => setDensity(v as Density)}
          />
          <Button
            variant={sidebar === "deep" ? "primary" : "default"}
            size="sm"
            onClick={() => setSidebar(sidebar === "deep" ? "light" : "deep")}
          >
            Deep sidebar
          </Button>
          <Button size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </Button>
        </div>
      </header>

      <div className="page page-wide" style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="page-head">
          <div>
            <h1 className="page-title">Product design system</h1>
            <p className="page-sub">
              The CMS's own brand — distinctly Rwandan. The flag palette is the
              workflow: blue approved, sun in&nbsp;review, green published.
            </p>
          </div>
          <Seg options={["EN", "RW", "FR"]} value={locale} onChange={setLocale} />
        </div>

        {/* Stats */}
        <div className="grid g4" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 22 }}>
          <Stat num="54" label="Published" accent="var(--green)" />
          <Stat num="7" label="In review" accent="var(--amber)" />
          <Stat num="12" label="Drafts" accent="var(--ink-4)" />
          <Stat num="3" label="Languages" accent="var(--accent)" />
        </div>

        {/* Buttons */}
        <div className="section-label" style={{ marginBottom: 10 }}>Buttons</div>
        <div className="flex g3 wrap items-center" style={{ marginBottom: 8 }}>
          <Button variant="primary">Publish</Button>
          <Button>Save draft</Button>
          <Button variant="ghost">Preview</Button>
          <Button variant="success">Approve</Button>
          <Button variant="danger">Request changes</Button>
        </div>
        <div className="flex g3 wrap items-center" style={{ marginBottom: 24 }}>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
        </div>

        {/* Workflow badges — the flag palette */}
        <div className="section-label" style={{ marginBottom: 10 }}>
          Workflow status — flag palette
        </div>
        <div className="flex g2 wrap items-center" style={{ marginBottom: 24 }}>
          <Badge status="draft" dot />
          <Badge status="review" dot />
          <Badge status="approved" dot />
          <Badge status="published" dot />
          <Badge status="changes" dot />
        </div>

        {/* Cards + form */}
        <div className="grid g4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Card>
            <CardHead>
              <CardTitle>New entry</CardTitle>
              <Badge status="draft" />
            </CardHead>
            <CardBody>
              <Field label="Title" required htmlFor="title">
                <Input id="title" defaultValue="Apply for a business permit" />
              </Field>
              <Field label="Slug" htmlFor="slug">
                <Input id="slug" defaultValue="apply-for-a-business-permit" />
              </Field>
              <Field label="Summary" optional htmlFor="sum">
                <Textarea id="sum" placeholder="One or two sentences…" />
              </Field>
              <div className="flex g3">
                <Button variant="primary">Submit for review</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHead>
              <CardTitle>Pages</CardTitle>
              <span className="muted t13">Ministry of Health</span>
            </CardHead>
            <CardBody style={{ paddingTop: 12 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Locale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="t-title">Apply for a permit</td>
                    <td><Badge status="published" dot /></td>
                    <td className="muted">EN · RW</td>
                  </tr>
                  <tr>
                    <td className="t-title">Health centres near you</td>
                    <td><Badge status="review" dot /></td>
                    <td className="muted">EN</td>
                  </tr>
                  <tr>
                    <td className="t-title">Vaccination schedule</td>
                    <td><Badge status="draft" dot /></td>
                    <td className="muted">EN</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center g3" style={{ marginTop: 14 }}>
                <Avatar name="Jeanne U" size={28} />
                <Avatar name="Eric N" size={28} />
                <Avatar name="Alice M" size={28} />
                <span className="muted t13">3 editors</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
