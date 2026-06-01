import type { TranslationKey } from '@/lib/translations';

export type YaredMelodyShelfId = 'yaredic-chants' | 'daily-prayer' | 'mahlet-feast';

export type YaredMelodyPlaylist = {
  id: string;
  titleKey: TranslationKey;
  geez: string;
};

export type YaredMelodyShelf = {
  id: YaredMelodyShelfId;
  titleKey: TranslationKey;
  geez: string;
  playlists: YaredMelodyPlaylist[];
};

/** Static Chants catalog — grouped like the Orthodox Catalog on Read. */
export const YARED_MELODY_SHELVES: YaredMelodyShelf[] = [
  {
    id: 'yaredic-chants',
    titleKey: 'listen.yaredShelfYaredawi',
    geez: 'የያሬድያዊ ዜማ',
    playlists: [
      { id: 'geez', titleKey: 'listen.yaredGez', geez: 'ግእዝ' },
      { id: 'ezel', titleKey: 'listen.yaredEzel', geez: 'ኤዘል' },
      { id: 'araray', titleKey: 'listen.yaredAraray', geez: 'አራራይ' },
    ],
  },
  {
    id: 'daily-prayer',
    titleKey: 'listen.yaredShelfDailyPrayer',
    geez: 'የዘወትር ጸሎት',
    playlists: [
      { id: 'wudase-mariam', titleKey: 'listen.yaredWudaseMariam', geez: 'ውዳሴ ማርያም' },
      { id: 'morning-prayer', titleKey: 'listen.yaredMorningPrayer', geez: 'የጥዋት ጸሎት' },
      { id: 'evening-prayer', titleKey: 'listen.yaredEveningPrayer', geez: 'የምሽት ጸሎት' },
      { id: 'psalms', titleKey: 'listen.yaredPsalms', geez: 'መዝሙረ ዳዊት' },
    ],
  },
  {
    id: 'mahlet-feast',
    titleKey: 'listen.yaredShelfMahletFeast',
    geez: 'የማህሌትና በዓል ዜማ',
    playlists: [
      { id: 'timkat', titleKey: 'listen.yaredTimkat', geez: 'ጥምቀት' },
      { id: 'fasika', titleKey: 'listen.yaredFasika', geez: 'ፋሲካ' },
    ],
  },
];

export function shelfForYaredMelody(shelfId: string | undefined): YaredMelodyShelf {
  return (
    YARED_MELODY_SHELVES.find((shelf) => shelf.id === shelfId) ?? YARED_MELODY_SHELVES[0]
  );
}

export function findYaredPlaylist(playlistId: string) {
  for (const shelf of YARED_MELODY_SHELVES) {
    const playlist = shelf.playlists.find((item) => item.id === playlistId);
    if (playlist) return { shelf, playlist };
  }
  return null;
}
