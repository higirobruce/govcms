import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, Container, Prose } from "@govcms/design-system";
import { getEntry } from "../../../../lib/api";

export const revalidate = 60;

type Params = { locale: string; type: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, type, slug } = await params;
  const entry = await getEntry(type, slug, locale);
  return { title: entry ? `${entry.title} — Government of Rwanda` : "Not found" };
}

export default async function EntryPage({ params }: { params: Promise<Params> }) {
  const { locale, type, slug } = await params;
  const entry = await getEntry(type, slug, locale);
  if (!entry) notFound();

  const body = String(entry.data.body ?? "");
  const paras = body.split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <Breadcrumb
        items={[
          { label: locale === "rw" ? "Ahabanza" : "Home", href: `/${locale}` },
          { label: entry.title },
        ]}
      />
      <Container>
        <article className="section" style={{ paddingTop: 8 }}>
          <h1 style={{ fontSize: "2.25rem" }}>{entry.title}</h1>
          {entry.summary && (
            <p style={{ fontSize: "1.1875rem", color: "var(--ink-2)", maxWidth: "60ch" }}>{entry.summary}</p>
          )}
          <Prose>
            {paras.length > 0 ? (
              paras.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="muted">This page has no content yet.</p>
            )}
          </Prose>
        </article>
      </Container>
    </>
  );
}
