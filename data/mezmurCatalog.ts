import type { TranslationKey } from '@/lib/translations';

export type MezmurLanguage = 'english' | 'amharic';

/** Hymn theme — matches mezmur.type in Supabase and the approval sheet. */
export type MezmurCategory = 'nisiha' | 'praise' | 'maryam' | 'fasting' | 'other';

export type MezmurCategoryShelf = {
  id: MezmurCategory;
  titleKey: TranslationKey;
};

/** Category shelves within each language (English / Amharic hymns catalog). */
export const MEZMUR_CATEGORY_SHELVES: MezmurCategoryShelf[] = [
  { id: 'nisiha', titleKey: 'listen.mezmurCategoryNisiha' },
  { id: 'praise', titleKey: 'listen.mezmurCategoryPraise' },
  { id: 'fasting', titleKey: 'listen.mezmurCategoryFasting' },
  { id: 'other', titleKey: 'listen.mezmurCategoryOther' },
  { id: 'maryam', titleKey: 'listen.mezmurCategoryMaryam' },
];

export function shelfForMezmurCategory(category: string | undefined): MezmurCategoryShelf {
  return (
    MEZMUR_CATEGORY_SHELVES.find((shelf) => shelf.id === category) ?? {
      id: 'other',
      titleKey: 'listen.mezmurCategoryOther',
    }
  );
}

export type MezmurLanguageShelf = {
  language: MezmurLanguage;
  title: string;
  geez: string;
  description: string;
};

/** Language shelves within the Hymns Catalog (mirrors Orthodox Catalog genre shelves). */
export const MEZMUR_LANGUAGE_SHELVES: MezmurLanguageShelf[] = [
  {
    language: 'english',
    title: 'English',
    geez: 'English Mezmurs',
    description: 'Mezmur channels and playlists in English.',
  },
  {
    language: 'amharic',
    title: 'Amharic',
    geez: 'አማርኛ መዝሙር',
    description: 'Mezmur channels and playlists in Amharic.',
  },
];

export function shelfForMezmurLanguage(language: string | undefined): MezmurLanguageShelf {
  return (
    MEZMUR_LANGUAGE_SHELVES.find((shelf) => shelf.language === language) ??
    MEZMUR_LANGUAGE_SHELVES[0]
  );
}

/** Canonical channel name for Egeziharya Yilma mezmur. */
export const EGEZIHARYA_YILMA_CHANNEL = 'Egeziharya Yilma';

/** Young Orthodox Tewahedo Christians — English hymns catalog. */
export const YOTC_CHOIR_CHANNEL = 'Y.O.T.C. Choir';

/** Channels that show songs directly — no playlist step in the app. */
export const MEZMUR_SONGS_ONLY_CHANNELS = new Set<string>([
  EGEZIHARYA_YILMA_CHANNEL,
  YOTC_CHOIR_CHANNEL,
]);

export function isMezmurSongsOnlyChannel(artist: string): boolean {
  return MEZMUR_SONGS_ONLY_CHANNELS.has(artist);
}

/** Playlists on the Mezmur Debter Zetewahedo channel. */
export const MEZMUR_DEBTER_CHANNEL = 'Mezmur Debter Zetewahedo';

export const MEZMUR_DEBTER_ALBUMS = new Set([
  'የዐቢይ ጾም መዝሙራት',
  'የዓመቱ ያሬዳዊ መዝሙራት || Mezmur Collection',
  'English Hymns',
  // Legacy titles from earlier sync mappings
  'Great Lent Mezmurs',
  'Annual Collection',
]);

/** Channel → hymns catalog shelf (whole artist lives on one side). */
export const MEZMUR_CHANNEL_LANGUAGE: Record<string, MezmurLanguage> = {
  'Ahadu Studios': 'english',
  [EGEZIHARYA_YILMA_CHANNEL]: 'english',
  [MEZMUR_DEBTER_CHANNEL]: 'english',
  [YOTC_CHOIR_CHANNEL]: 'english',
};
