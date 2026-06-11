import type { ImageContentFit, ImageContentPosition } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';

import { getBibleBook } from '@/data/bibleCanon';

const PRAYER_BOOK_PREFIX = 'prayer:';

function isPrayerBookId(bookId: string): boolean {
  return bookId.startsWith(PRAYER_BOOK_PREFIX);
}

function prayerSlugFromBookId(bookId: string): string {
  return bookId.slice(PRAYER_BOOK_PREFIX.length);
}

/** Bundled Read catalog cover art — keyed by catalog book id. */
export const ReadCoverArt = {
  bible: require('@/assets/covers/read/bible.png'),
  'daily-prayer': require('@/assets/covers/read/daily-prayer.png'),
  horologium: require('@/assets/covers/read/horologium.png'),
  liturgy: require('@/assets/covers/read/liturgy.png'),
  'wudase-mariam': require('@/assets/covers/read/wudase-mariam.png'),
} as const satisfies Record<string, ImageSourcePropType>;

export type ReadCoverSource = string | ImageSourcePropType;

/** Slight warmth for bright covers — kept lighter than the old `deep` treatment. */
export type ReadCoverTone = 'default' | 'warm';

export type ReadCoverFocus = {
  contentFit?: ImageContentFit;
  contentPosition?: ImageContentPosition;
  /** Zoom past scanned margins (e.g. black border on source art). */
  scale?: number;
};

/** Per-title treatment tweaks. */
export const ReadCoverToneById: Partial<Record<keyof typeof ReadCoverArt, ReadCoverTone>> = {
  'daily-prayer': 'warm',
  horologium: 'warm',
};

export const ReadCoverFocusById: Partial<Record<keyof typeof ReadCoverArt, ReadCoverFocus>> = {
  'daily-prayer': {
    contentFit: 'cover',
    contentPosition: 'center',
  },
  horologium: {
    contentFit: 'cover',
    contentPosition: 'center',
  },
};

/** Prefer a bundled cover; fall back to remote placeholder URLs. */
export function resolveReadCoverSource(bookId: string, fallback: string): ReadCoverSource {
  return ReadCoverArt[bookId as keyof typeof ReadCoverArt] ?? fallback;
}

export function getReadCoverTone(bookId: string): ReadCoverTone {
  return ReadCoverToneById[bookId as keyof typeof ReadCoverArt] ?? 'default';
}

export function getReadCoverFocus(bookId: string): ReadCoverFocus | undefined {
  return ReadCoverFocusById[bookId as keyof typeof ReadCoverArt];
}

/** Shared EOTC Bible jacket for any individual canon book. */
export function getCanonScriptureCover(): ReadCoverSource {
  return ReadCoverArt.bible;
}

/** Cover for Continue Reading rows — canon scripture uses the Bible jacket. */
export function resolveContinueReadingCover(
  bookId: string,
  fallback: string
): ReadCoverSource {
  if (isPrayerBookId(bookId)) {
    return resolveReadCoverSource(prayerSlugFromBookId(bookId), fallback);
  }
  if (getBibleBook(bookId)) {
    return getCanonScriptureCover();
  }
  return getCanonScriptureCover();
}

/** Catalog / progress id → tone + focus helpers. */
export function getReadCoverMeta(bookId: string) {
  const catalogId = isPrayerBookId(bookId) ? prayerSlugFromBookId(bookId) : bookId;
  return {
    tone: getReadCoverTone(catalogId),
    focus: getReadCoverFocus(catalogId),
  };
}
