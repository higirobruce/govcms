import Link from "next/link";
import { Container, SiteHeader } from "@govcms/design-system";

export default function NotFound() {
  return (
    <>
      <SiteHeader org="Government of Rwanda" sub="Government of Rwanda" home="/en" />
      <main id="main">
        <Container>
          <div className="section">
            <p className="muted" style={{ fontWeight: 700, letterSpacing: ".06em" }}>ERROR 404</p>
            <h1 style={{ fontSize: "2.25rem" }}>Page not found</h1>
            <p style={{ maxWidth: "60ch", color: "var(--ink-2)" }}>
              The page you were looking for doesn’t exist or may have moved.
            </p>
            <p>
              <Link href="/en">Return to the homepage</Link>
            </p>
          </div>
        </Container>
      </main>
    </>
  );
}
