import { Image, type ImageSourcePropType } from 'react-native';

import { BorderRadius } from '@/constants/theme';
import { AHADU_STUDIOS_CHANNEL } from '@/data/ahaduAlbums';
import { MAHIBERE_KIDUSAN_CHANNEL } from '@/data/mahibereKidusanAlbums';
import {
  EGEZIHARYA_YILMA_CHANNEL,
  YOTC_CHOIR_CHANNEL,
  YOTC_NATION_OF_THE_CROSS_ALBUM,
} from '@/data/mezmurCatalog';

const AHADU_ALBUM_ART: Record<string, number> = {
  'Translated Hymns (Volume I)': require('@/assets/images/ahadu-translated-hymns-vol-i.png'),
  'Translated Hymns (Volume II)': require('@/assets/images/ahadu-translated-hymns-vol-ii.png'),
  'Translated Hymns (Volume III)': require('@/assets/images/ahadu-translated-hymns-vol-iii.png'),
  'Translated Hymns (Volume IV)': require('@/assets/images/ahadu-translated-hymns-vol-iv.png'),
  'Translated Hymns (Volume V)': require('@/assets/images/ahadu-translated-hymns-vol-v.png'),
  Cana: require('@/assets/images/ahadu-cana.png'),
  'My Guide': require('@/assets/images/ahadu-my-guide.png'),
  'Praise Night || 2024 OTYD Winter Conference': require('@/assets/images/ahadu-praise-night.png'),
  'Glory to God (Volume I)': require('@/assets/images/ahadu-glory-to-god-vol-i.png'),
  'Glory to God (Volume II)': require('@/assets/images/ahadu-glory-to-god-vol-ii.png'),
  'Glory to God (Volume III)': require('@/assets/images/ahadu-glory-to-god-vol-iii.png'),
  'Glory to God (Volume IV)': require('@/assets/images/ahadu-glory-to-god-vol-iv.png'),
  'God of Creation': require('@/assets/images/ahadu-god-of-creation.png'),
};

const EGEZIHARYA_ALBUM_ART: Record<string, number> = {
  'Tewahedo I': require('@/assets/images/egeziharya-tewahedo-i.png'),
  'Tewahedo II': require('@/assets/images/egeziharya-tewahedo-ii.png'),
};

const MAHIBERE_ALBUM_ART: Record<string, number> = {
  'Proclaim His Name': require('@/assets/images/mahibere-proclaim-his-name.png'),
};

const YOTC_ALBUM_ART: Record<string, number> = {
  [YOTC_NATION_OF_THE_CROSS_ALBUM]: require('@/assets/images/yotc-choir.png'),
};

const BUNDLED_ALBUM_ART: Record<string, Record<string, number>> = {
  [AHADU_STUDIOS_CHANNEL]: AHADU_ALBUM_ART,
  [EGEZIHARYA_YILMA_CHANNEL]: EGEZIHARYA_ALBUM_ART,
  [MAHIBERE_KIDUSAN_CHANNEL]: MAHIBERE_ALBUM_ART,
  [YOTC_CHOIR_CHANNEL]: YOTC_ALBUM_ART,
};

const uriCache = new Map<string, string>();

function getBundledAlbumArtSource(artist: string, album: string): number | undefined {
  return BUNDLED_ALBUM_ART[artist]?.[album];
}

/** @deprecated Use getBundledAlbumArtSource */
export function getAhaduAlbumArtSource(album: string): number | undefined {
  return AHADU_ALBUM_ART[album];
}

export function isAhaduBundledAlbumArt(artist: string, album: string): boolean {
  return artist === AHADU_STUDIOS_CHANNEL && Boolean(getBundledAlbumArtSource(artist, album));
}

/** Taller than 16:9 so covers align with multi-line titles beside them (4:3). */
const albumFrameHeight = (width: number) => Math.round((width * 3) / 4);

export const MEZMUR_ALBUM_LIST_FRAME = {
  width: 100,
  height: albumFrameHeight(100),
  borderRadius: BorderRadius.md,
} as const;

/** Channel playlist list — denser than default list rows. */
export const MEZMUR_ALBUM_LIST_FRAME_COMPACT = {
  width: 72,
  height: albumFrameHeight(72),
  borderRadius: BorderRadius.sm,
} as const;

export const MEZMUR_ALBUM_RAIL_FRAME = {
  width: 154,
  height: albumFrameHeight(154),
  borderRadius: 12,
} as const;

/** User playlist shelf — slightly smaller than catalog album rails. */
export const MEZMUR_PLAYLIST_RAIL_FRAME = {
  width: 136,
  height: albumFrameHeight(136),
  borderRadius: 10,
} as const;

export const MEZMUR_ALBUM_HERO_FRAME = {
  width: 116,
  height: albumFrameHeight(116),
  borderRadius: BorderRadius.md,
} as const;

/** Channels with bundled square PNG album art (shown with cover crop in 16:9 frames). */
export function isSquareAlbumArt(artist: string): boolean {
  return (
    artist === AHADU_STUDIOS_CHANNEL ||
    artist === EGEZIHARYA_YILMA_CHANNEL ||
    artist === MAHIBERE_KIDUSAN_CHANNEL ||
    artist === YOTC_CHOIR_CHANNEL
  );
}

/** @deprecated Use isSquareAlbumArt */
export function isAhaduSquareAlbumArt(artist: string): boolean {
  return isSquareAlbumArt(artist);
}

export function mezmurAlbumImageSource(
  artist: string,
  album: string,
  fallbackUri: string | null | undefined
): ImageSourcePropType | null {
  const asset = getBundledAlbumArtSource(artist, album);
  if (asset) return asset;
  return fallbackUri ? { uri: fallbackUri } : null;
}

/** Best thumbnail URI for an album (bundled art or first track). */
export function pickAlbumThumbnailUrl(
  artist: string,
  album: string,
  songs: ReadonlyArray<{ thumbnailUrl?: string | null }>
): string | null {
  const fallback = songs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null;
  return resolveMezmurAlbumThumbnail(artist, album, fallback);
}

export function resolveMezmurAlbumThumbnail(
  artist: string,
  album: string,
  fallback: string | null
): string | null {
  const local = getBundledAlbumArtSource(artist, album);
  if (!local) return fallback;

  const cacheKey = `${artist}::${album}`;
  let uri = uriCache.get(cacheKey);
  if (!uri) {
    uri = Image.resolveAssetSource(local).uri;
    uriCache.set(cacheKey, uri);
  }
  return uri;
}
