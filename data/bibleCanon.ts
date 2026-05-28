/**
 * Ethiopian Orthodox Tewahedo Church — 81-book canon
 * (46 Old Testament + 35 New Testament)
 *
 * Source: `bibleCanon.json` (also used by Supabase seed).
 */

import canon from './bibleCanon.json';

export type Testament = 'Old Testament' | 'New Testament';
export type CanonTier = 'Narrow' | 'Broader';

export type BibleBook = {
  book_id: string;
  title_vernacular: string;
  title_geez: string;
  title_english: string;
  testament: Testament;
  canon_tier: CanonTier;
  display_order: number;
};

export function getBookTitle(book: BibleBook, language: 'english' | 'amharic' | 'geez'): string {
  if (language === 'english') return book.title_english;
  if (language === 'geez') return book.title_geez;
  return book.title_vernacular;
}

export const BIBLE_CANON_81: readonly BibleBook[] = canon as BibleBook[];

const byDisplayOrder = (a: BibleBook, b: BibleBook) => a.display_order - b.display_order;

export const OLD_TESTAMENT_BOOKS = BIBLE_CANON_81.filter((b) => b.testament === 'Old Testament').sort(
  byDisplayOrder,
);
export const NEW_TESTAMENT_BOOKS = BIBLE_CANON_81.filter((b) => b.testament === 'New Testament').sort(
  byDisplayOrder,
);
export const BROADER_CANON_BOOKS = BIBLE_CANON_81.filter((b) => b.canon_tier === 'Broader');

export function getBibleBook(bookId: string): BibleBook | undefined {
  return BIBLE_CANON_81.find((b) => b.book_id === bookId);
}
