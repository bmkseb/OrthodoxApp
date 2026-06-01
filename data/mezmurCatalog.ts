export type MezmurLanguage = 'english' | 'amharic';

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

/** Channel → hymns catalog shelf (whole artist lives on one side). */
export const MEZMUR_CHANNEL_LANGUAGE: Record<string, MezmurLanguage> = {
  'Ahadu Studios': 'english',
  'Egeziharya Yilma': 'amharic',
};
