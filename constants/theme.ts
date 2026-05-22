/**
 * Design System - Orthodox App
 */

import { Platform } from 'react-native';

export const Palette = {
  background: '#000000',
  gold: '#C9933A',
  text: '#F5ECD7',
  crimson: '#8B1A1A',
  muted: '#8A8070',
  mutedGold: 'rgba(201, 147, 58, 0.7)',
  card: '#1E1A14',
  glass: 'rgba(20, 18, 16, 0.95)',
} as const;

export const Opacity = {
  goldBorder: 0.15,
  goldBorderSubtle: 0.2,
  watermark: 0.06,
  dividerGold: 0.15,
  vignette: 0.4,
} as const;

export const Layout = {
  pagePadding: 20,
  sectionGap: 32,
  headerContentGap: 16,
  cardGap: 12,
  titleSubtitleGap: 4,
  tabBarSafe: 24,
  cardRadius: 16,
  cardBorder: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  listAccentBorder: 3,
  listContentInset: 12,
  badgeSize: 12,
  thumbnailSize: 60,
  miniPlayerHeight: 72,
} as const;

export const Typography = {
  pageTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 40,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
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
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
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
