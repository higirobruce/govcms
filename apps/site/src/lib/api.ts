// Server-side reader for the Core public delivery API. ISR: revalidate 60s.
const API = process.env.API_URL ?? "http://localhost:4001/api";
const SITE = process.env.SITE_SLUG ?? "pilot";
// Origin that serves uploaded media. Dev/local: the Core API host (static
// /uploads). Prod: an object-storage CDN — set ASSET_URL to that origin.
const ASSET = process.env.ASSET_URL ?? API.replace(/\/api\/?$/, "");

/** Resolve a stored media reference to a fetchable URL. Absolute URLs pass
 *  through; root-relative /uploads paths get the asset origin prefixed. */
export function assetUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return `${ASSET}${src}`;
  return src;
}

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
  images: EntryImage[];
  updatedAt: string;
}
export interface EntryImage {
  key: string;
  label: string;
  /** Stored reference — pass through assetUrl() before use. */
  src: string;
  /** Locale-resolved alt text from the media library ("" = decorative). */
  alt: string;
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
