import { EGEZIHARYA_YILMA_CHANNEL } from '@/data/mezmurCatalog';

/** YouTube playlist for Tewahedo I (kbrands). */
export const TEWAHEDO_I_PLAYLIST_ID = 'PLcPG070ZCoi6CzbWwIix7ByO5T7W4DA9a';

/** YouTube playlist for Tewahedo II (Meskel Academy / EOTC English Hymn). */
export const TEWAHEDO_II_PLAYLIST_ID = 'PLVQcEO-g_x0PpVgMGncyxkRuI0Wuc-E29';

/** Track order from Egeziharya Yilma - Tewahedo I (Full Album). */
export const TEWAHEDO_I_TRACK_ORDER = [
  'Introduction',
  'Truth',
  'Jacob in Beersheba',
  'Walk in the Light of God',
  'Come Forth and Sing',
  'Ephrata',
  'Mother of God',
  'Almighty God',
  'Come In',
  'Emanuel',
  'End',
] as const;

/** Track order from Egeziharya Yilma - Tewahedo 2 (English) (Full Album). */
export const TEWAHEDO_II_TRACK_ORDER = [
  'Opening',
  'Conception',
  'Christmas',
  'Epiphany',
  'Transfiguration',
  'Hosanna',
  'Good Friday',
  'Easter',
  'Ascension',
  'Pentecost',
] as const;

export type EgeziharyaAlbumDef = {
  album: string;
  songs: readonly string[];
};

/** Albums with a fixed Spotify / YouTube playlist track order. */
export const EGEZIHARYA_ORDERED_ALBUMS: EgeziharyaAlbumDef[] = [
  { album: 'Tewahedo I', songs: TEWAHEDO_I_TRACK_ORDER },
  { album: 'Tewahedo II', songs: TEWAHEDO_II_TRACK_ORDER },
];

export const EGEZIHARYA_ORDERED_ALBUM_NAMES = new Set(
  EGEZIHARYA_ORDERED_ALBUMS.map((entry) => entry.album)
);

/** Per-album YouTube video overrides (canonical track title → video id). */
export const EGEZIHARYA_TRACK_OVERRIDES: Record<string, Record<string, string>> = {
  'Tewahedo II': {
    Hosanna: 'l7Ann2xII2I',
  },
};

export { EGEZIHARYA_YILMA_CHANNEL };
