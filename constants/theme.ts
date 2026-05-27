/**
 * Design System - Orthodox App
 */

import { Platform } from 'react-native';

export const Palette = {
  background: '#100D0A',
  backgroundDeep: '#0B0907',
  surface: '#181410',
  surfaceWarm: '#1E1814',
  gold: '#C9933A',
  text: '#F4ECD8',
  crimson: '#8B1A1A',
  muted: '#A8A092',
  mutedGold: 'rgba(201, 147, 58, 0.55)',
  card: '#221C16',
  glass: 'rgba(34, 28, 22, 0.86)',
} as const;

export const Opacity = {
  goldBorder: 0.12,
  goldBorderSubtle: 0.16,
  watermark: 0.05,
  dividerGold: 0.24,
  vignette: 0.06,
  vignetteHero: 0.12,
  vignetteCard: 0.14,
} as const;

export const Overlays = {
  heroBottom: ['transparent', 'rgba(20, 18, 16, 0.28)', 'rgba(0, 0, 0, 0.62)'] as const,
  heroBottomStrong: ['transparent', 'rgba(0, 0, 0, 0.32)', 'rgba(0, 0, 0, 0.68)'] as const,
  heroBottomCompact: ['transparent', 'rgba(20, 18, 16, 0.32)', 'rgba(0, 0, 0, 0.58)'] as const,
  heroBottomLower40: [
    'transparent',
    'transparent',
    'rgba(20, 18, 16, 0.18)',
    'rgba(0, 0, 0, 0.68)',
  ] as const,
  heroCinematic: [
    'transparent',
    'transparent',
    'rgba(12, 10, 8, 0.22)',
    'rgba(0, 0, 0, 0.78)',
  ] as const,
} as const;

/** Strict spacing scale — only these values (px). */
export const Space = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s24: 24,
  s32: 32,
  s40: 40,
  s48: 48,
} as const;

/** Vertical rhythm */
export const Rhythm = {
  tight: Space.s8,
  medium: Space.s12,
  section: Space.s24,
  major: Space.s32,
} as const;

export const Layout = {
  pagePadding: Space.s16,
  sectionDividerAbove: Space.s24,
  sectionDividerBelow: Space.s24,
  sectionHeaderBottom: Space.s12,
  sectionContentBottom: Space.s24,
  sectionGap: Space.s24,
  sectionHeaderGap: Space.s12,
  headerContentGap: Space.s8,
  cardGap: Space.s12,
  listItemGap: Space.s8,
  titleSubtitleGap: Space.s4,
  iconRailWidth: Space.s24,
  tabBarSafe: Space.s24,
  cardRadius: Space.s16,
  cardBorder: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  cardBorderThin: `rgba(201, 147, 58, 0.08)`,
  listAccentBorder: 2,
  listContentInset: Space.s12,
  badgeSize: Space.s12,
  thumbnailSize: 56,
  miniPlayerHeight: 64,
  searchBarHeight: 42,
} as const;

export const Typography = {
  pageTitle: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -1.1,
    lineHeight: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  metadata: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.6,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  /** @deprecated use sectionTitle */
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: Palette.muted,
  },
};

export const Animation = {
  pressSpring: { damping: 15, stiffness: 400, mass: 0.5 },
  pressScale: 0.97,
  pressOpacity: 0.85,
  pressDuration: 100,
  tabFadeMs: 200,
  detailSlideMs: 350,
};

const orthodoxTheme = {
  text: Palette.text,
  background: Palette.background,
  tint: Palette.gold,
  accent: Palette.crimson,
  muted: Palette.muted,
  seeAll: Palette.mutedGold,
  icon: Palette.muted,
  tabIconDefault: Palette.muted,
  tabIconSelected: Palette.gold,
  cardBackground: Palette.card,
};

export const Colors = {
  light: orthodoxTheme,
  dark: orthodoxTheme,
};

export const Spacing = {
  xs: Space.s4,
  sm: Space.s8,
  md: Space.s12,
  base: Space.s16,
  lg: Space.s24,
  xl: Space.s24,
  xxl: Space.s32,
  xxxl: Space.s40,
};

export const BorderRadius = {
  sm: Space.s8,
  md: Space.s12,
  lg: Space.s16,
  xl: Space.s24,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
