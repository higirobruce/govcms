import type { ReactNode } from "react";
import { CoatOfArms } from "./CoatOfArms";

export function SkipLink({ label = "Skip to main content" }: { label?: string }) {
  return (
    <a href="#main" className="skip-link">
      {label}
    </a>
  );
}

export function Container({ children }: { children: ReactNode }) {
  return <div className="container">{children}</div>;
}

export interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}
export interface LangOption {
  code: string;
  label: string;
  href: string;
  current?: boolean;
}

export function SiteHeader({
  org,
  sub,
  home = "/",
  nav = [],
  languages = [],
  searchLabel = "Search",
  searchAction,
}: {
  org: string;
  sub?: string;
  home?: string;
  nav?: NavItem[];
  languages?: LangOption[];
  searchLabel?: string;
  /** GET form target for site search (e.g. /en/search). Omit to hide search. */
  searchAction?: string;
}) {
  return (
    <header className="gov-header">
      <div className="gov-band" aria-hidden="true">
        <i /><i /><i />
      </div>
      <Container>
        <div className="gov-masthead">
          <a className="gov-crest" href={home}>
            <span className="crest-mark">
              <CoatOfArms size={44} />
            </span>
            <span className="crest-text">
              <span className="org">{org}</span>
              {sub && <span className="sub">{sub}</span>}
            </span>
          </a>
          <span className="spacer" />
          {languages.length > 0 && (
            <nav className="gov-lang" aria-label="Language">
              {languages.map((l) => (
                <a key={l.code} href={l.href} aria-current={l.current ? "true" : undefined} lang={l.code}>
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          {searchAction && (
            <form className="gov-search" action={searchAction} role="search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-5-5" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder={searchLabel}
                aria-label={searchLabel}
                style={{ border: 0, outline: "none", background: "transparent", font: "inherit", color: "inherit", width: 130 }}
              />
            </form>
          )}
        </div>
      </Container>
      {nav.length > 0 && (
        <Container>
          <nav className="gov-nav" aria-label="Primary">
            {nav.map((n) => (
              <a key={n.href} href={n.href} aria-current={n.current ? "page" : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
        </Container>
      )}
    </header>
  );
}

export function SiteFooter({
  org,
  links = [],
  note,
}: {
  org: string;
  links?: { label: string; href: string }[];
  note?: string;
}) {
  return (
    <footer className="gov-footer">
      <Container>
        <div className="inner">
          <div className="stack">
            <strong>{org}</strong>
            <div className="muted" style={{ color: "#AEC2D4", fontSize: ".875rem" }}>
              Government of Rwanda
            </div>
          </div>
          <nav className="links" aria-label="Footer">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="fine">
            {note ?? `© ${new Date().getFullYear()} ${org}. All rights reserved.`}
          </div>
        </div>
      </Container>
    </footer>
  );
}

export function Hero({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <section className="gov-hero">
      <Container>
        <div className="inner">
          <h1>{title}</h1>
          {lead && <p>{lead}</p>}
        </div>
      </Container>
    </section>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="gov-breadcrumb" aria-label="Breadcrumb">
      <Container>
        {items.map((it, i) => (
          <span key={i}>
            {i > 0 && <span className="sep" aria-hidden="true">/</span>}
            {it.href ? <a href={it.href}>{it.label}</a> : <span>{it.label}</span>}
          </span>
        ))}
      </Container>
    </nav>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose">{children}</div>;
}

/**
 * Accessible, responsive image. `alt` is required — pass "" only for purely
 * decorative images. Alt text is authored in the media library (per-locale) and
 * resolved by the delivery API; the component never invents it.
 */
export function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
}) {
  return (
    <figure className="gov-figure">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function CardGrid({ cols = 3, children }: { cols?: 2 | 3; children: ReactNode }) {
  return <div className={`gov-grid cols-${cols}`}>{children}</div>;
}

export function LinkCard({
  kicker,
  title,
  summary,
  href,
}: {
  kicker?: string;
  title: string;
  summary?: string;
  href: string;
}) {
  return (
    <a className="gov-card" href={href}>
      {kicker && <div className="kicker">{kicker}</div>}
      <h3>{title}</h3>
      {summary && <p>{summary}</p>}
    </a>
  );
}
