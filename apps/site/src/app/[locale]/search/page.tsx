import { Breadcrumb, CardGrid, Container, Hero, LinkCard } from "@govcms/design-system";
import { search } from "../../../lib/api";

export const dynamic = "force-dynamic"; // results depend on the query string

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? (await search(query, locale)) ?? [] : [];
  const rw = locale === "rw";

  return (
    <>
      <Breadcrumb
        items={[
          { label: rw ? "Ahabanza" : "Home", href: `/${locale}` },
          { label: rw ? "Shakisha" : "Search" },
        ]}
      />
      <Hero
        title={rw ? "Shakisha" : "Search"}
        lead={
          query
            ? `${results.length} ${rw ? "ibisubizo kuri" : "results for"} “${query}”`
            : rw
              ? "Andika ijambo ushakisha."
              : "Type a term to search this site."
        }
      />
      <Container>
        <div className="section">
          {query && results.length === 0 && (
            <p className="muted">
              {rw ? "Nta bisubizo bibonetse." : "No results found."}
            </p>
          )}
          {results.length > 0 && (
            <CardGrid cols={2}>
              {results.map((r) => (
                <LinkCard
                  key={r.id}
                  kicker={r.type}
                  title={r.title}
                  summary={r.summary}
                  href={`/${locale}/${r.type}/${r.slug}`}
                />
              ))}
            </CardGrid>
          )}
        </div>
      </Container>
    </>
  );
}
