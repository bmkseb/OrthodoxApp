import type { TranslationKey } from '@/lib/translations';

export type HymnsCatalogSection = 'playlists' | 'channels';

export type HymnsCatalogSectionData = {
  section: HymnsCatalogSection;
  titleKey: TranslationKey;
  geez: string;
  descriptionKey: TranslationKey;
};

/** Hymns Catalog See All — mirrors Orthodox Catalog genre shelves (Scripture / Prayer). */
export const HYMNS_CATALOG_SECTIONS: HymnsCatalogSectionData[] = [
  {
    section: 'playlists',
    titleKey: 'listen.mezmurPlaylistsShelf',
    geez: 'የዜማ ዝርዝሮች',
    descriptionKey: 'listen.userPlaylistsDescription',
  },
  {
    section: 'channels',
    titleKey: 'listen.mezmurChannelsShelf',
    geez: 'ቻናሎች',
    descriptionKey: 'listen.channelsCatalogDescription',
  },
];

export function shelfForHymnsSection(section: string | undefined): HymnsCatalogSectionData {
  return (
    HYMNS_CATALOG_SECTIONS.find((shelf) => shelf.section === section) ??
    HYMNS_CATALOG_SECTIONS[0]
  );
}
