# @govcms/admin-ui

The **product** design system — govcms's own brand, used by the CMS editor (`apps/admin`).

> Separate from `@govcms/design-system` (the RISA-conformant government delivery
> system used by public sites). The admin tool is free to look like a great modern
> app; the public sites must follow the Government of Rwanda guideline.

Implemented from a **Claude Design** handoff: distinctly Rwandan, institutionally
trustworthy. The flag palette *is* the workflow — **blue = approved, sun/amber =
in review, green = published**.

## Stack & theming

React 19 · Tailwind v4 (utilities) · a CSS-variable token system. Type: **Source
Serif 4** (display) + **Public Sans** (UI) + **IBM Plex Mono** (labels).

Theming is **attribute-driven** on the root element:

- `data-theme="dark"` — dark mode
- `data-density="compact"` — denser layout
- `data-sidebar="deep"` — dark/deep sidebar
- override `--accent` / `--accent-strong` / `--accent-soft` / `--accent-ink` to reskin

## Use it

```tsx
import { Button, Card, Badge, Field, Input } from "@govcms/admin-ui";
import "@govcms/admin-ui/styles.css"; // tokens + components + fonts
```

The stylesheet `@import`s the three Google fonts; for best loading, also add the
`<link rel="preconnect">` + font `<link>` in your app's HTML (see `preview/index.html`).

## See it

```bash
pnpm --filter @govcms/admin-ui preview   # http://localhost:4002
```

Kitchen sink with live Tweaks: accent, density, deep sidebar, dark mode, locale.

## Components

`Button` · `Badge` (workflow statuses) · `Card`/`CardHead`/`CardTitle`/`CardBody` ·
`Field` · `Input`/`Textarea` · `Seg` (locale switcher) · `Avatar` · `Stat` · `Logo`/`LogoMark`.

The full design system lives in `src/styles/tokens.css` (tokens + component classes);
components are thin React wrappers over those classes.
