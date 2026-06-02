import { getSupabase } from '@/lib/supabase';

export type PrayerLanguage = 'english' | 'amharic' | 'geez' | 'transliteration';

export const PRAYER_LANGUAGES: PrayerLanguage[] = ['english', 'amharic', 'geez'];

/** Compact labels for the language tabs — kept short so up to four fit one row. */
export const PRAYER_LANGUAGE_LABELS: Record<PrayerLanguage, string> = {
  english: 'English',
  amharic: 'አማርኛ',
  geez: 'ግዕዝ',
  transliteration: 'Translit.',
};

/** Full language names, used in prose (e.g. the "not yet available" message). */
export const PRAYER_LANGUAGE_NAMES: Record<PrayerLanguage, string> = {
  english: 'English',
  amharic: 'Amharic',
  geez: 'Geʼez',
  transliteration: 'Transliteration',
};

export type PrayerBook = {
  id: string;
  slug: string;
  titleEn: string;
  titleAm: string | null;
  titleGeez: string | null;
  /** Driven by prayer_books.available_languages (maintained by a DB trigger). */
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
  position: number;
  english: string | null;
  amharic: string | null;
  geez: string | null;
  transliteration: string | null;
};

type Row = Record<string, unknown>;

/** Trimmed string or null — treats whitespace-only content as empty. */
function nonEmpty(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** First defined column among several candidate names (schema-tolerant read). */
function readCol(row: Row, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = nonEmpty(row[key]);
    if (v !== null) return v;
  }
  return null;
}

function readNumber(row: Row, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
}

/** Keep only recognized language codes; fall back to English-only when empty. */
function normalizeLanguages(raw: unknown): PrayerLanguage[] {
  const list = Array.isArray(raw) ? raw : [];
  const filtered = list.filter((lang): lang is PrayerLanguage =>
    PRAYER_LANGUAGES.includes(lang as PrayerLanguage)
  );
  return filtered.length > 0 ? filtered : ['english'];
}

/** English when present, otherwise the first available language. */
export function defaultPrayerLanguage(available: PrayerLanguage[]): PrayerLanguage {
  return available.includes('english') ? 'english' : (available[0] ?? 'english');
}

/** A prayer book by its slug (e.g. 'daily-prayer'), or null when unavailable. */
export async function fetchPrayerBook(slug: string): Promise<PrayerBook | null> {
  const supabase = getSupabase();
  if (!supabase || !slug) return null;

  const { data, error } = await supabase
    .from('prayer_books')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Row;
  return {
    id: String(row.id),
    slug: String(row.slug ?? slug),
    titleEn: readCol(row, 'title_en', 'title_english') ?? slug,
    titleAm: readCol(row, 'title_am', 'title_amharic'),
    titleGeez: readCol(row, 'title_geez'),
    availableLanguages: normalizeLanguages(row.available_languages),
  };
}

/** Sections of a book, ordered by sort_order/position ascending. */
export async function fetchPrayerSections(bookId: string): Promise<PrayerSection[]> {
  const supabase = getSupabase();
  if (!supabase || !bookId) return [];

  const { data, error } = await supabase.from('prayer_sections').select('*').eq('book_id', bookId);

  if (error) throw error;

  const rows = (data ?? []) as Row[];
  return rows
    .map((r) => ({
      id: String(r.id),
      titleEn: readCol(r, 'title_en', 'title_english') ?? '',
      titleAm: readCol(r, 'title_am', 'title_amharic'),
      titleGeez: readCol(r, 'title_geez'),
      sortOrder: readNumber(r, 'sort_order', 'position') ?? 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Verses of a section, ordered by position ascending; all language columns selected. */
export async function fetchPrayerVerses(sectionId: string): Promise<PrayerVerse[]> {
  const supabase = getSupabase();
  if (!supabase || !sectionId) return [];

  const { data, error } = await supabase
    .from('prayer_verses')
    .select('*')
    .eq('section_id', sectionId);

  if (error) throw error;

  const rows = (data ?? []) as Row[];
  return rows
    .map((r) => ({
      id: String(r.id),
      position: readNumber(r, 'position', 'verse_number', 'sort_order') ?? 0,
      english: readCol(r, 'text_english', 'content_en'),
      amharic: readCol(r, 'text_amharic', 'content_am'),
      geez: readCol(r, 'text_geez', 'content_geez'),
      transliteration: readCol(r, 'text_transliteration', 'transliteration'),
    }))
    .sort((a, b) => a.position - b.position);
}

/** Verse body text for the active language (no fallback — null means absent). */
export function pickVerseText(verse: PrayerVerse, lang: PrayerLanguage): string | null {
  if (lang === 'amharic') return verse.amharic;
  if (lang === 'geez') return verse.geez;
  if (lang === 'transliteration') return verse.transliteration;
  return verse.english;
}

/** Verse body for display: the active language, falling back to English when null. */
export function pickVerseTextOrEnglish(verse: PrayerVerse, lang: PrayerLanguage): string | null {
  return pickVerseText(verse, lang) ?? verse.english;
}

/** A section "has" a language when at least one of its verses has content for it. */
export function sectionHasLanguage(verses: PrayerVerse[], lang: PrayerLanguage): boolean {
  return verses.some((verse) => pickVerseText(verse, lang) !== null);
}

/**
 * Pick a title for the active language, falling back to English when null.
 * Section/book titles have no transliteration column, so transliteration uses
 * the English title.
 */
export function pickPrayerText(
  row: { en: string; am: string | null; geez: string | null },
  lang: PrayerLanguage
): string {
  if (lang === 'amharic') return row.am || row.en;
  if (lang === 'geez') return row.geez || row.en;
  return row.en;
}

