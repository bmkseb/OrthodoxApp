import type { ScriptureLang, ScriptureSampleFile, VerseRecord } from '@/types/scripture';

import { getSupabase, isSupabaseConfigured } from './supabase';

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
    .select('verse_id, book_id, chapter, verse, text_amharic, text_geez, text_english')
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
