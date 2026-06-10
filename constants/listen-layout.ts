import { BorderRadius, Layout, Space } from '@/constants/theme';

/** 4:3 art area for Listen horizontal rails (playlists, channels, continue). */
const railArtHeight = (width: number) => Math.round((width * 3) / 4);

/** Unified rail card — playlists, continue listening, create tile. */
export const LISTEN_RAIL_FRAME = {
  width: 128,
  height: railArtHeight(128),
  borderRadius: BorderRadius.md,
  gap: Space.s8,
} as const;

/** Horizontal ScrollView content style for Listen rails (continue, playlists, create). */
export const LISTEN_RAIL_SCROLL_CONTENT = {
  gap: LISTEN_RAIL_FRAME.gap,
  paddingRight: Layout.pagePadding,
} as const;

/** Full row height for catalog playlist rails (thumbnail + title + subtitle). */
export const LISTEN_CATALOG_RAIL_ROW_HEIGHT =
  LISTEN_RAIL_FRAME.height +
  LISTEN_RAIL_FRAME.gap +
  17 * 2 +
  2 +
  13;

/** Netflix-style ranked hymn rail — fixed rank column keeps thumbnails aligned. */
export const LISTEN_RANKED_RAIL = {
  rankColumnWidth: 44,
  rankColumnWidthDouble: 56,
  rankToCardGap: 2,
  rankToCardGapDouble: Space.s8,
  rankFontSize: 56,
  rankFontSizeDouble: 52,
  /** Nudge double-digit ranks down to align with single-digit baseline. */
  rankTenOffsetY: 4,
} as const;

export const LISTEN_RANKED_RAIL_SCROLL_CONTENT = {
  gap: Space.s8,
  paddingLeft: Space.s4,
  paddingRight: Layout.pagePadding,
} as const;

/** Circular channel avatars on the Listen tab channel rail. */
export const LISTEN_CHANNEL_RAIL = {
  avatarSize: 104,
  cardWidth: 120,
  gap: Space.s4,
} as const;

export const LISTEN_CHANNEL_RAIL_SCROLL_CONTENT = {
  gap: LISTEN_CHANNEL_RAIL.gap,
  paddingRight: Layout.pagePadding,
} as const;

/** Hero featured carousel on Listen tab. */
export const LISTEN_FEATURED_HEIGHT = 200;

/** Max channel or playlist cards on Listen tab horizontal shelves (rest in See all). */
export const LISTEN_SHELF_PREVIEW_LIMIT = 5;

/** Playlist slots on the shelf after the create tile (5 visible = create + 4 playlists). */
export const LISTEN_PLAYLIST_SHELF_SLOTS = LISTEN_SHELF_PREVIEW_LIMIT - 1;

/** Saved hymns preview rows on Listen tab. */
export const LISTEN_SAVED_THUMB = {
  width: 64,
  height: Math.round((64 * 9) / 16),
  borderRadius: BorderRadius.md,
  gap: Space.s12,
} as const;

/** Vertical rhythm between Listen tab sections (dense, premium). */
export const ListenSectionSpacing = {
  hero: Space.s24,
  primary: Space.s24,
  secondary: Space.s16,
  tertiary: Space.s16,
  headerBottom: Space.s8,
} as const;
