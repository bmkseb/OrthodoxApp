export type ScriptureLang = 'english' | 'amharic' | 'geez';

export type Footnote = {
  ref: string;
  text: string;
};

export type VerseRecord = {
  verse_id?: string;
  book_id?: string;
  chapter?: number;
  verse: number;
  text_amharic: string | null;
  text_geez: string | null;
  text_english: string | null;
  /** JSON-encoded Footnote[] for English (WEBBE notes), or null. */
  footnote?: string | null;
  /** JSON-encoded Footnote[] for Amharic, or null. Independent of the English notes. */
  footnote_amharic?: string | null;
  /** JSON-encoded Footnote[] for Geʼez, or null. Independent of the English notes. */
  footnote_geez?: string | null;
};

export type ScriptureSampleFile = {
  book_id: string;
  chapters: Record<string, VerseRecord[]>;
};
