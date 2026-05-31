import { getSupabase } from '@/lib/supabase';

export type PrayerLanguage = 'english' | 'amharic' | 'geez';

export const PRAYER_LANGUAGES: PrayerLanguage[] = ['english', 'amharic', 'geez'];

export type PrayerBook = {
  id: string;
  slug: string;
  titleEn: string;
  titleAm: string | null;
  titleGeez: string | null;
  availableLanguages: PrayerLanguage[];
};

export type PrayerSection = {
  id: string;
  titleEn: string;
  titleAm: string | null;
  titleGeez: string | null;
  sortOrder: number;
};

export type PrayerVerse = {
  id: string;
  verseNumber: number;
  contentEn: string;
  contentAm: string | null;
  contentGeez: string | null;
};

type BookRow = {
  id: string | number;
  slug: string;
  title_en: string;
  title_am: string | null;
  title_geez: string | null;
  available_languages: string[] | null;
};

type SectionRow = {
  id: string | number;
  title_en: string;
  title_am: string | null;
  title_geez: string | null;
  sort_order: number | null;
};

type VerseRow = {
  id: string | number;
  verse_number: number | null;
  content_en: string;
  content_am: string | null;
  content_geez: string | null;
};

/** Keep only recognized language codes; fall back to English-only when empty. */
function normalizeLanguages(raw: string[] | null | undefined): PrayerLanguage[] {
  const filtered = (raw ?? []).filter((lang): lang is PrayerLanguage =>
    PRAYER_LANGUAGES.includes(lang as PrayerLanguage)
  );
  return filtered.length > 0 ? filtered : ['english'];
}

/** A prayer book by its slug (e.g. 'daily-prayer'), or null when unavailable. */
export async function fetchPrayerBook(slug: string): Promise<PrayerBook | null> {
  const supabase = getSupabase();
  if (!supabase || !slug) return null;

  const { data, error } = await supabase
    .from('prayer_books')
    .select('id, slug, title_en, title_am, title_geez, available_languages')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as BookRow;
  return {
    id: String(row.id),
    slug: row.slug,
    titleEn: row.title_en,
    titleAm: row.title_am ?? null,
    titleGeez: row.title_geez ?? null,
    availableLanguages: normalizeLanguages(row.available_languages),
  };
}

/** Sections of a book, ordered by sort_order ascending. */
export async function fetchPrayerSections(bookId: string): Promise<PrayerSection[]> {
  const supabase = getSupabase();
  if (!supabase || !bookId) return [];

  const { data, error } = await supabase
    .from('prayer_sections')
    .select('id, title_en, title_am, title_geez, sort_order')
    .eq('book_id', bookId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as SectionRow[];
  return rows.map((r) => ({
    id: String(r.id),
    titleEn: r.title_en,
    titleAm: r.title_am ?? null,
    titleGeez: r.title_geez ?? null,
    sortOrder: r.sort_order ?? 0,
  }));
}

/** Verses of a section, ordered by verse_number ascending. */
export async function fetchPrayerVerses(sectionId: string): Promise<PrayerVerse[]> {
  const supabase = getSupabase();
  if (!supabase || !sectionId) return [];

  const { data, error } = await supabase
    .from('prayer_verses')
    .select('id, verse_number, content_en, content_am, content_geez')
    .eq('section_id', sectionId)
    .order('verse_number', { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as VerseRow[];
  return rows.map((r) => ({
    id: String(r.id),
    verseNumber: r.verse_number ?? 0,
    contentEn: r.content_en,
    contentAm: r.content_am ?? null,
    contentGeez: r.content_geez ?? null,
  }));
}

/** Pick the column for the active language, falling back to English. */
export function pickPrayerText(
  row: { en: string; am: string | null; geez: string | null },
  lang: PrayerLanguage
): string {
  if (lang === 'amharic') return row.am || row.en;
  if (lang === 'geez') return row.geez || row.en;
  return row.en;
}
