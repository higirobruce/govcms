import type { ReactNode } from "react";
import { SiteFooter, SiteHeader, SkipLink } from "@govcms/design-system";
import { getSite, LOCALE_LABEL, LOCALES } from "../../lib/api";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const NAV: Record<string, { home: string; services: string; news: string; about: string }> = {
  en: { home: "Home", services: "Services", news: "News", about: "About" },
  rw: { home: "Ahabanza", services: "Serivisi", news: "Amakuru", about: "Abo turi bo" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const site = await getSite();
  const org = site?.name ?? "Government of Rwanda";
  const t = NAV[locale] ?? NAV.en;

  return (
    <div lang={locale}>
      <SkipLink />
      <SiteHeader
        org={org}
        sub="Government of Rwanda"
        home={`/${locale}`}
        nav={[
          { label: t.home, href: `/${locale}`, current: true },
          { label: t.services, href: `/${locale}#services` },
          { label: t.news, href: `/${locale}#news` },
        ]}
        languages={(site?.locales ?? LOCALES).map((code) => ({
          code,
          label: code.toUpperCase(),
          href: `/${code}`,
          current: code === locale,
        }))}
        searchLabel={locale === "rw" ? "Shakisha" : "Search"}
      />
      <main id="main">{children}</main>
      <SiteFooter
        org={org}
        links={[
          { label: locale === "rw" ? "Politiki y'ibanga" : "Privacy policy", href: `/${locale}/page/privacy` },
          { label: locale === "rw" ? "Twandikire" : "Contact", href: `/${locale}/page/contact` },
          { label: "irembo.gov.rw", href: "https://irembo.gov.rw" },
        ]}
        note={`© ${new Date().getFullYear()} ${org}. ${LOCALE_LABEL[locale] ?? ""}`}
      />
    </div>
  );
}
