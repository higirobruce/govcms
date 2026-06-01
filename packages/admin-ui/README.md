# @govcms/admin-ui

The **product** design system — govcms's own brand, used by the CMS editor (`apps/admin`).

> This is intentionally **separate** from `@govcms/design-system` (the RISA-conformant
> government delivery system used by public sites). The admin tool is free to look like a
> great modern app; the public sites must follow the Government of Rwanda guideline.

## Stack

React 19 · Tailwind v4 (CSS-first theming) · class-variance-authority · shadcn-style primitives we own.

## Use it

It's an internal source package — consumers (e.g. `apps/admin`) import directly from source:

```tsx
import { Button, Card, Badge } from "@govcms/admin-ui";
import "@govcms/admin-ui/styles.css"; // tokens + Tailwind
```

## See it

```bash
pnpm --filter @govcms/admin-ui preview   # http://localhost:4002
```

A "govcms Studio" kitchen sink with a light/dark toggle.

## Tokens

Brand tokens live in `src/styles/tokens.css` as semantic CSS variables (`--primary`,
`--background`, …) for light and `.dark`, exposed as Tailwind utilities via `@theme inline`.
Indigo accent, slate neutrals. Edit there to reskin the whole product.

## Components

`Button`, `Card` (+ parts), `Input`, `Label`, `Badge`. Add more as `apps/admin` needs them.
