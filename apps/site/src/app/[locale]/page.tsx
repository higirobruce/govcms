import { CardGrid, Container, Hero, LinkCard } from "@govcms/design-system";
import { getSite, listEntries, type PubEntry } from "../../lib/api";

export const revalidate = 60;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [site, services, news, pages] = await Promise.all([
    getSite(),
    listEntries("service", locale),
    listEntries("news", locale),
    listEntries("page", locale),
  ]);

  const lead =
    locale === "rw"
      ? "Amakuru na serivisi bya Leta, ahantu hamwe."
      : "Official government information and services, in one place.";

  return (
    <>
      <Hero title={site?.name ?? "Government of Rwanda"} lead={lead} />
      <Container>
        <Section id="services" title={locale === "rw" ? "Serivisi" : "Services"} entries={services} locale={locale} kicker="Service" />
        <Section id="news" title={locale === "rw" ? "Amakuru" : "News"} entries={news} locale={locale} kicker="News" />
        <Section id="pages" title={locale === "rw" ? "Impapuro" : "Pages"} entries={pages} locale={locale} kicker="Page" />
      </Container>
    </>
  );
}

function Section({
  id,
  title,
  entries,
  locale,
  kicker,
}: {
  id: string;
  title: string;
  entries: PubEntry[] | null;
  locale: string;
  kicker: string;
}) {
  if (!entries || entries.length === 0) return null;
  return (
    <section id={id} className="section">
      <h2 className="section-title">{title}</h2>
      <CardGrid cols={3}>
        {entries.map((e) => (
          <LinkCard
            key={e.id}
            kicker={kicker}
            title={e.title}
            summary={e.summary}
            href={`/${locale}/${e.type}/${e.slug}`}
          />
        ))}
      </CardGrid>
    </section>
  );
}
