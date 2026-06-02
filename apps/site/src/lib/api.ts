// Server-side reader for the Core public delivery API. ISR: revalidate 60s.
const API = process.env.API_URL ?? "http://localhost:4001/api";
const SITE = process.env.SITE_SLUG ?? "pilot";

export const LOCALES = ["en", "rw"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_LABEL: Record<string, string> = { en: "English", rw: "Kinyarwanda", fr: "Français", sw: "Kiswahili" };

export interface PubEntry {
  id: string;
  type: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  data: Record<string, unknown>;
  updatedAt: string;
}
export interface PubSite {
  name: string;
  slug: string;
  locales: string[];
  defaultLocale: string;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/public/${SITE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getSite = () => get<PubSite>("/site");
export const listEntries = (type: string, locale: string) =>
  get<PubEntry[]>(`/entries?type=${encodeURIComponent(type)}&locale=${encodeURIComponent(locale)}`);
export const getEntry = (type: string, slug: string, locale: string) =>
  get<PubEntry>(`/entry/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);

export interface SearchResult {
  id: string;
  type: string;
  slug: string;
  locale: string;
  title: string;
  summary: string;
}
export const search = (q: string, locale: string) =>
  get<SearchResult[]>(`/search?q=${encodeURIComponent(q)}&locale=${encodeURIComponent(locale)}`);
