import type { TranslationKey } from '@/lib/translations';

export type SermonsCatalogSection = 'playlists' | 'channels';

export type SermonsCatalogSectionData = {
  section: SermonsCatalogSection;
  titleKey: TranslationKey;
  geez: string;
  descriptionKey: TranslationKey;
};

/** Sermons Catalog See All — mirrors Hymns Catalog shelves. */
export const SERMONS_CATALOG_SECTIONS: SermonsCatalogSectionData[] = [
  {
    section: 'playlists',
    titleKey: 'listen.mezmurPlaylistsShelf',
    geez: 'የስብከት ዝርዝሮች',
    descriptionKey: 'listen.sermonUserPlaylistsDescription',
  },
  {
    section: 'channels',
    titleKey: 'listen.mezmurChannelsShelf',
    geez: 'ቻናሎች',
    descriptionKey: 'listen.sermonChannelsCatalogDescription',
  },
];

export function shelfForSermonsSection(section: string | undefined): SermonsCatalogSectionData {
  return (
    SERMONS_CATALOG_SECTIONS.find((shelf) => shelf.section === section) ??
    SERMONS_CATALOG_SECTIONS[0]
  );
}
