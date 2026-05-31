import type { Footnote, ScriptureLang, ScriptureSampleFile, VerseRecord } from '@/types/scripture';

import { BIBLE_CANON_81, getBibleBook, getBookTitle } from '@/data/bibleCanon';
import { buildSearchSnippet } from './search-snippets';
import { getSupabase, isSupabaseConfigured } from './supabase';

export type VerseSearchResult = {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  snippet: string;
};

const SAMPLE_MODULES: Record<string, ScriptureSampleFile> = {
  genesis: require('@/data/scriptureSamples/genesis.json') as ScriptureSampleFile,
};

export function pickVerseText(verse: VerseRecord, lang: ScriptureLang): string {
  const primary =
    lang === 'english'
      ? verse.text_english
      : lang === 'geez'
        ? verse.text_geez
        : verse.text_amharic;

  return (
    primary?.trim() ||
    verse.text_amharic?.trim() ||
    verse.text_geez?.trim() ||
    verse.text_english?.trim() ||
    ''
  );
}

/** Parse the JSON-encoded footnotes for a verse (returns [] when absent or malformed). */
export function parseFootnotes(verse: VerseRecord): Footnote[] {
  if (!verse.footnote) return [];
  try {
    const parsed = JSON.parse(verse.footnote);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((f) => ({ ref: String(f?.ref ?? '').trim(), text: String(f?.text ?? '').trim() }))
      .filter((f) => f.text.length > 0);
  } catch {
    // Legacy rows stored a plain string note.
    const text = verse.footnote.trim();
    return text ? [{ ref: '', text }] : [];
  }
}

function uniqueSortedChapters(rows: { chapter: number }[]): number[] {
  const set = new Set(rows.map((r) => r.chapter));
  return [...set].sort((a, b) => a - b);
}

async function fetchChaptersFromSupabase(bookId: string): Promise<number[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('verses')
    .select('chapter')
    .eq('book_id', bookId);

  if (error) throw error;
  return uniqueSortedChapters(data ?? []);
}

async function fetchVersesFromSupabase(bookId: string, chapter: number): Promise<VerseRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('verses')
    .select('verse_id, book_id, chapter, verse, text_amharic, text_geez, text_english, footnote')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

function chaptersFromSample(bookId: string): number[] {
  const sample = SAMPLE_MODULES[bookId];
  if (!sample) return [];
  return Object.keys(sample.chapters)
    .map((ch) => Number(ch))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

function versesFromSample(bookId: string, chapter: number): VerseRecord[] {
  const sample = SAMPLE_MODULES[bookId];
  if (!sample) return [];
  return sample.chapters[String(chapter)] ?? [];
}

/** Chapters available for a book (Supabase first, then bundled samples). */
export async function fetchBookChapters(bookId: string): Promise<number[]> {
  if (isSupabaseConfigured()) {
    try {
      const chapters = await fetchChaptersFromSupabase(bookId);
      if (chapters.length > 0) return chapters;
    } catch {
      // fall through to samples
    }
  }
  return chaptersFromSample(bookId);
}

/** All verses in one chapter. */
export async function fetchChapterVerses(bookId: string, chapter: number): Promise<VerseRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const verses = await fetchVersesFromSupabase(bookId, chapter);
      if (verses.length > 0) return verses;
    } catch {
      // fall through to samples
    }
  }
  return versesFromSample(bookId, chapter);
}

export function hasScriptureSample(bookId: string): boolean {
  return bookId in SAMPLE_MODULES;
}

export function scriptureDataSourceLabel(bookId: string): 'supabase' | 'sample' | 'none' {
  if (isSupabaseConfigured()) return 'supabase';
  if (hasScriptureSample(bookId)) return 'sample';
  return 'none';
}

function verseTextColumn(lang: ScriptureLang): 'text_english' | 'text_amharic' | 'text_geez' {
  if (lang === 'geez') return 'text_geez';
  if (lang === 'amharic') return 'text_amharic';
  return 'text_english';
}

function findBookByName(bookPart: string) {
  const normalized = bookPart.trim().toLowerCase();
  return BIBLE_CANON_81.find((b) => {
    const english = b.title_english.toLowerCase();
    const firstWord = english.split(/\s+/)[0];
    return (
      b.book_id === normalized.replace(/\s+/g, '-') ||
      english === normalized ||
      english.startsWith(`${normalized} `) ||
      firstWord === normalized ||
      firstWord.startsWith(normalized)
    );
  });
}

/** Parse references like "John 3" (chapter only). */
export function parseChapterReference(input: string): { bookId: string; chapter: number } | null {
  const trimmed = input.trim();
  const verseRef = parseScriptureReference(trimmed);
  if (verseRef) {
    return { bookId: verseRef.bookId, chapter: verseRef.chapter };
  }

  const match = trimmed.match(/^(.+?)\s+(\d+)\s*$/i);
  if (!match) return null;

  const chapter = Number(match[2]);
  if (!Number.isFinite(chapter)) return null;

  const book = findBookByName(match[1]);
  if (!book) return null;
  return { bookId: book.book_id, chapter };
}

/** Parse references like "John 3:16" or "Genesis 1:1". */
export function parseScriptureReference(
  input: string
): { bookId: string; chapter: number; verse: number } | null {
  const match = input.trim().match(/^(.+?)\s+(\d+)\s*:\s*(\d+)/i);
  if (!match) return null;

  const bookPart = match[1].trim();
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;

  const book = findBookByName(bookPart);
  if (!book) return null;
  return { bookId: book.book_id, chapter, verse };
}

function mapVerseSearchRow(
  row: { book_id: string; chapter: number; verse: number; text: string },
  lang: ScriptureLang,
  query: string
): VerseSearchResult {
  const book = getBibleBook(row.book_id);
  const bookTitle = book ? getBookTitle(book, lang) : row.book_id;
  const reference = `${bookTitle} ${row.chapter}:${row.verse}`;
  return {
    bookId: row.book_id,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
    reference,
    snippet: buildSearchSnippet(row.text, query),
  };
}

function searchSampleVerses(term: string, lang: ScriptureLang): VerseSearchResult[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];

  const hits: VerseSearchResult[] = [];
  for (const [bookId, sample] of Object.entries(SAMPLE_MODULES)) {
    for (const [chapterKey, verses] of Object.entries(sample.chapters)) {
      for (const verse of verses) {
        const text = pickVerseText(verse, lang);
        if (!text.toLowerCase().includes(q)) continue;
        hits.push(
          mapVerseSearchRow(
            { book_id: bookId, chapter: Number(chapterKey), verse: verse.verse, text },
            lang,
            term
          )
        );
        if (hits.length >= 20) return hits;
      }
    }
  }
  return hits;
}

function verseRowText(row: Record<string, unknown>, col: ReturnType<typeof verseTextColumn>): string {
  return String(row[col] ?? '');
}

/** Search verse text (and scripture references) across the canon. */
export async function searchVerses(term: string, lang: ScriptureLang): Promise<VerseSearchResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const ref = parseScriptureReference(trimmed);
  const supabase = getSupabase();
  const col = verseTextColumn(lang);

  if (supabase) {
    try {
      if (ref) {
        const { data } = await supabase
          .from('verses')
          .select(`book_id, chapter, verse, ${col}`)
          .eq('book_id', ref.bookId)
          .eq('chapter', ref.chapter)
          .eq('verse', ref.verse)
          .limit(1);

        const row = data?.[0] as Record<string, string | number> | undefined;
        if (row) {
          return [
            mapVerseSearchRow(
              {
                book_id: String(row.book_id),
                chapter: Number(row.chapter),
                verse: Number(row.verse),
                text: String(row[col] ?? ''),
              },
              lang,
              trimmed
            ),
          ];
        }
      }

      if (lang === 'english') {
        const { data, error } = await supabase
          .from('verses')
          .select(`book_id, chapter, verse, ${col}`)
          .textSearch(col, trimmed, { type: 'plain', config: 'english' })
          .limit(20);

        if (!error && data?.length) {
          return data.map((row) =>
            mapVerseSearchRow(
              {
                book_id: String(row.book_id),
                chapter: Number(row.chapter),
                verse: Number(row.verse),
                text: verseRowText(row as Record<string, unknown>, col),
              },
              lang,
              trimmed
            )
          );
        }
      }

      const { data, error } = await supabase
        .from('verses')
        .select(`book_id, chapter, verse, ${col}`)
        .ilike(col, `%${trimmed}%`)
        .limit(20);

      if (!error && data?.length) {
        return data.map((row) =>
          mapVerseSearchRow(
            {
              book_id: String(row.book_id),
              chapter: Number(row.chapter),
              verse: Number(row.verse),
              text: verseRowText(row as Record<string, unknown>, col),
            },
            lang,
            trimmed
          )
        );
      }
    } catch {
      // fall through to bundled samples
    }
  }

  return searchSampleVerses(trimmed, lang);
}
