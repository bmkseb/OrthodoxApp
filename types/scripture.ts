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
  /** JSON-encoded Footnote[] (WEBBE English notes), or null. */
  footnote?: string | null;
};

export type ScriptureSampleFile = {
  book_id: string;
  chapters: Record<string, VerseRecord[]>;
};
