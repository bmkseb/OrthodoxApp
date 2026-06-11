/**
 * Design System - Orthodox App
 *
 * Color tokens live here. Components should read colors via `useTheme()` /
 * `useThemeTokens()` so one palette update propagates everywhere.
 */

import { Platform, type ViewStyle } from 'react-native';

export type AppPalette = {
  background: string;
  backgroundDeep: string;
  surface: string;
  surfaceWarm: string;
  /** Primary gold — verse refs, selected tab, active rings (#B8860B light). */
  gold: string;
  /** Lighter gold — subtle tints and fills only (#C9A227 light). */
  goldLight: string;
  text: string;
  crimson: string;
  muted: string;
  mutedGold: string;
  card: string;
  glass: string;
  /** Page dividers and general borders. */
  border: string;
  /** Crisp 1px edge on elevated cards. */
  cardBorder: string;
  /** Soft circle behind quick-access / toolbar icons. */
  iconCircleBg: string;
  /** Deep oxblood — section header text only. Never fills or borders. */
  liturgical: string;
  /** Warm gradient stops for streak / engagement cards. */
  streakGradientStart: string;
  streakGradientEnd: string;
  sheet: string;
  navGlass: string;
  statusBar: 'light' | 'dark';
  shadowColor: string;
};

/** Shared shadow presets (iOS + Android elevation). */
export type SacredTokens = {
  /** Warm ivory — scripture display cards only. */
  scriptureIvory: string;
  /** Outer gold frame on scripture cards (light). */
  scriptureFrameOuter: string;
  /** Inner inset hairline on scripture cards (light). */
  scriptureFrameInner: string;
  /** Warm fill for functional cards (streak). */
  functionalWarm: string;
  /** Quick Access / active tab icon medallion fill. */
  medallionFill: string;
  /** 1px ring around medallions at 40% opacity. */
  medallionRing: string;
  /** Page top atmosphere wash start. */
  pageWashTop: string;
  /** Cream body text on dark scripture heroes. */
  cream: string;
  creamMuted: string;
  /** Espresso gradient for Bible hero backgrounds. */
  espressoStart: string;
  espressoEnd: string;
  /** Double-rule on dark scripture heroes. */
  heroFrameOuter: string;
  heroFrameInner: string;
  /** Continue-reading generated cover rotation. */
  coverEspresso: string;
  coverForest: string;
  coverOxblood: string;
  /** Tab bar top hairline. */
  tabBarHairline: string;
  /** Active day-ring halo on streak card. */
  activeRingGlow: string;
};

export const SacredTokensLight: SacredTokens = {
  scriptureIvory: '#FFFDF7',
  scriptureFrameOuter: '#C9A227',
  scriptureFrameInner: '#E8DCC8',
  functionalWarm: '#F7F1E3',
  medallionFill: '#F5EDD8',
  medallionRing: 'rgba(184, 134, 11, 0.4)',
  pageWashTop: '#F5F2EB',
  cream: '#F5ECD8',
  creamMuted: 'rgba(245, 236, 216, 0.85)',
  espressoStart: '#2A211A',
  espressoEnd: '#1C1610',
  heroFrameOuter: '#D4AF37',
  heroFrameInner: '#8B6914',
  coverEspresso: '#2A211A',
  coverForest: '#1F2E22',
  coverOxblood: '#4A2326',
  tabBarHairline: 'rgba(184, 134, 11, 0.25)',
  activeRingGlow: 'rgba(201, 162, 39, 0.3)',
};

export const SacredTokensDark: SacredTokens = {
  scriptureIvory: '#1A1512',
  scriptureFrameOuter: '#B8842F',
  scriptureFrameInner: 'rgba(175, 125, 45, 0.35)',
  functionalWarm: '#1A1512',
  medallionFill: 'rgba(175, 125, 45, 0.16)',
  medallionRing: 'rgba(175, 125, 45, 0.38)',
  pageWashTop: '#1A1713',
  cream: '#F4ECD8',
  creamMuted: 'rgba(244, 236, 216, 0.78)',
  espressoStart: '#261E18',
  espressoEnd: '#18120E',
  heroFrameOuter: '#B8842F',
  heroFrameInner: '#7A5E12',
  coverEspresso: '#261E18',
  coverForest: '#1C2A20',
  coverOxblood: '#441F22',
  tabBarHairline: 'rgba(175, 125, 45, 0.24)',
  activeRingGlow: 'rgba(175, 125, 45, 0.32)',
};

export function getSacredTokens(scheme: ColorScheme): SacredTokens {
  return scheme === 'light' ? SacredTokensLight : SacredTokensDark;
}

/** Manuscript Edge — square scripture rubric cards (Verse of the Day, pull quotes). */
export type ManuscriptEdgeTokens = {
  background: string;
  hairline: string;
  spineGold: string;
  quoteText: string;
  reference: string;
  eyebrow: string;
};

export const ManuscriptEdgeLight: ManuscriptEdgeTokens = {
  background: '#FBF7EC',
  hairline: '#E8DCC8',
  spineGold: '#B8860B',
  quoteText: '#1A1815',
  reference: '#8B6914',
  eyebrow: '#B8860B',
};

export const ManuscriptEdgeDark: ManuscriptEdgeTokens = {
  background: '#1E1813',
  hairline: 'rgba(255, 255, 255, 0.10)',
  spineGold: '#B8842F',
  quoteText: '#F4ECD8',
  reference: '#B8842F',
  eyebrow: '#B8842F',
};

export function getManuscriptEdgeTokens(scheme: ColorScheme): ManuscriptEdgeTokens {
  return scheme === 'light' ? ManuscriptEdgeLight : ManuscriptEdgeDark;
}

/** Featured Bible hero — gold inner hairline at 40% on espresso gradient. */
export function getBibleHeroInnerHairline(scheme: ColorScheme): string {
  return scheme === 'light' ? 'rgba(184, 134, 11, 0.4)' : 'rgba(184, 132, 47, 0.38)';
}

export type ThemeShadows = {
  card: ViewStyle;
  cardSubtle: ViewStyle;
  /** Hero cards (e.g. Verse of the Day) — slightly stronger lift. */
  cardHero: ViewStyle;
  /** Quick Access tile pressed state — deeper lift. */
  tilePressed: ViewStyle;
  searchBar: ViewStyle;
  floatingNav: ViewStyle;
};

/** Dark manuscript theme — warm espresso charcoal (not flat black, not heavy brown). */
export const PaletteDark: AppPalette = {
  background: '#171512',
  backgroundDeep: '#0F0D0B',
  surface: '#1C1915',
  surfaceWarm: '#201C17',
  gold: '#B8842F',
  goldLight: 'rgba(175, 125, 45, 0.16)',
  text: '#F4ECD8',
  crimson: '#8B1A1A',
  muted: '#A09888',
  mutedGold: 'rgba(175, 125, 45, 0.52)',
  card: '#1E1813',
  glass: 'rgba(30, 24, 19, 0.88)',
  border: 'rgba(255, 255, 255, 0.10)',
  cardBorder: 'rgba(255, 255, 255, 0.10)',
  iconCircleBg: 'rgba(175, 125, 45, 0.14)',
  liturgical: '#C4888B',
  streakGradientStart: '#1C1915',
  streakGradientEnd: '#171512',
  sheet: '#191714',
  navGlass: 'rgba(15, 13, 11, 0.78)',
  statusBar: 'light',
  shadowColor: '#000000',
};

/** Cohesive light theme — warm parchment page, floating ivory cards, rich gold accents. */
export const PaletteLight: AppPalette = {
  background: '#F0EBE3',
  backgroundDeep: '#E2DACE',
  surface: '#FFFCF7',
  surfaceWarm: '#FAF5EB',
  gold: '#B8860B',
  goldLight: '#C9A227',
  text: '#1A1815',
  crimson: '#7A1515',
  muted: '#6B6862',
  mutedGold: '#6B6862',
  card: '#FFFCF7',
  glass: 'rgba(255, 252, 247, 0.94)',
  border: '#DAD4C8',
  cardBorder: '#E3DDD2',
  iconCircleBg: '#EDE6D8',
  liturgical: '#6B2C2F',
  streakGradientStart: '#FFFCF7',
  streakGradientEnd: '#F3EBDE',
  sheet: '#FFFCF7',
  navGlass: 'rgba(255, 252, 247, 0.96)',
  statusBar: 'dark',
  shadowColor: '#282319',
};

/** Static alias — prefer `usePalette()` in new code. Light branch default. */
export const Palette = PaletteLight;

export type ColorScheme = 'light' | 'dark';

export function getPalette(scheme: ColorScheme): AppPalette {
  return scheme === 'light' ? PaletteLight : PaletteDark;
}

/** Soft card sheen — gentle top lift, no hard center spotlight. */
export const GLOSSY_CARD_GRADIENT_LOCATIONS = [0, 0.32, 0.68, 1] as const;

/** Glossy semi-transparent card fill — subtle vertical depth, wide soft transitions. */
export function getGlossyCardGradient(
  palette: AppPalette,
  scheme: ColorScheme
): readonly [string, string, string, string] {
  if (scheme === 'light') {
    return [
      palette.card,
      palette.card,
      palette.streakGradientEnd,
      palette.backgroundDeep,
    ];
  }
  return [
    'rgba(32, 26, 20, 0.74)',
    'rgba(30, 24, 19, 0.72)',
    'rgba(30, 24, 19, 0.72)',
    'rgba(24, 19, 15, 0.68)',
  ];
}

/** @deprecated Cross-pass removed — kept for legacy imports. */
export function getGlossyCardCrossGradient(scheme: ColorScheme): readonly [string, string, string] {
  return scheme === 'light'
    ? ['transparent', 'transparent', 'transparent']
    : ['transparent', 'transparent', 'transparent'];
}

/** @deprecated Use getGlossyCardCrossGradient — kept for imports. */
export function getGlossyCardSheen(scheme: ColorScheme): readonly [string, string] {
  const cross = getGlossyCardCrossGradient(scheme);
  return [cross[1], 'transparent'];
}

/** Solid translucent fill when a gradient layer is not used. */
export function getGlossyCardBackground(
  palette: AppPalette,
  scheme: ColorScheme,
  depth: 'default' | 'deep' = 'default'
): string {
  if (scheme === 'light') {
    return depth === 'deep' ? palette.backgroundDeep : palette.card;
  }
  return depth === 'deep' ? 'rgba(26, 21, 17, 0.68)' : 'rgba(30, 24, 19, 0.72)';
}

/** Single warm card fill — streak gradient tokens (light) / soft glossy sheen (dark). */
export function getCardSurfaceGradient(
  palette: AppPalette,
  scheme: ColorScheme
): readonly [string, string, string, string] {
  if (scheme === 'light') {
    return [
      palette.streakGradientStart,
      palette.card,
      palette.streakGradientEnd,
      palette.backgroundDeep,
    ];
  }
  return getGlossyCardGradient(palette, scheme);
}

/** Explore / surfaced cards — soft glossy sheen in dark mode. */
export function getExploreCardGradient(
  palette: AppPalette,
  scheme: ColorScheme
): readonly [string, string, string, string] {
  return getGlossyCardGradient(palette, scheme);
}

/** Hairline edge — just enough to separate explore cards from the page. */
export function getExploreCardBorder(palette: AppPalette, scheme: ColorScheme): string {
  return scheme === 'light' ? palette.cardBorder : 'rgba(255, 255, 255, 0.12)';
}

/** Faint black outer ring — adds crisp separation from the page. */
export function getExploreCardOutline(scheme: ColorScheme): string {
  return scheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.38)';
}

/** Shared search bar, filter chips, and segment control colors for tab screens. */
export type TabChromeTokens = {
  searchBackground: string;
  searchBorder: string;
  searchBorderFocused: string;
  chipBackground: string;
  chipBorder: string;
  chipLabel: string;
  segmentBackground: string;
  segmentBorder: string;
  placeholder: string;
};

export function getTabChromeTokens(palette: AppPalette, scheme: ColorScheme): TabChromeTokens {
  return {
    searchBackground:
      scheme === 'dark'
        ? getGlossyCardBackground(palette, scheme, 'deep')
        : 'rgba(255, 255, 255, 0.62)',
    searchBorder:
      scheme === 'dark' ? `${palette.gold}47` : 'rgba(184, 134, 11, 0.22)',
    searchBorderFocused: `${palette.gold}66`,
    chipBackground:
      scheme === 'dark'
        ? getGlossyCardBackground(palette, scheme)
        : 'rgba(255, 255, 255, 0.78)',
    chipBorder: `${palette.gold}4D`,
    chipLabel: palette.muted,
    segmentBackground: getGlossyCardBackground(palette, scheme),
    segmentBorder: getExploreCardBorder(palette, scheme),
    placeholder: palette.muted,
  };
}

export function getShadows(scheme: ColorScheme): ThemeShadows {
  if (scheme === 'dark') {
    return {
      card: {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      },
      cardSubtle: {
        shadowColor: PaletteDark.gold,
        shadowOpacity: 0.14,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 3,
      },
      cardHero: {
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 7,
      },
      tilePressed: {
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
      },
      searchBar: {},
      floatingNav: {
        shadowColor: '#000000',
        shadowOpacity: 0.4,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 14,
      },
    };
  }

  return {
    card: {
      shadowColor: PaletteLight.shadowColor,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    cardSubtle: {
      shadowColor: PaletteLight.shadowColor,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    cardHero: {
      shadowColor: PaletteLight.shadowColor,
      shadowOpacity: 0.11,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    tilePressed: {
      shadowColor: PaletteLight.shadowColor,
      shadowOpacity: 0.14,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    searchBar: {
      shadowColor: PaletteLight.shadowColor,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    floatingNav: {
      shadowColor: PaletteLight.shadowColor,
      shadowOpacity: 0.14,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 6 },
      elevation: 14,
    },
  };
}

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
  /** Header → its section content (12–16px). Single source for within-section rhythm. */
  sectionInner: Space.s16,
  /** Total between sections: prior content → divider → next header (~20px, tight). */
  sectionGap: Space.s24,
  /** Space above the divider (after previous section content). */
  sectionGapBefore: Space.s8,
  /** Space below the divider (before next section header). */
  sectionGapAfter: Space.s16,
  /** @deprecated Use sectionInner */
  sectionHeaderBottom: Space.s16,
  /** @deprecated Use sectionGapBefore */
  sectionDividerAbove: Space.s16,
  /** @deprecated Use sectionGapAfter */
  sectionDividerBelow: Space.s24,
  /** @deprecated Use sectionGap — do not stack on SectionBlock */
  sectionContentBottom: Space.s24,
  /** @deprecated Use sectionGap — do not stack on SectionBlock */
  sectionMajorGap: Space.s24,
  /** @deprecated Dividers own vertical rhythm; keep 0 on section wrappers */
  sectionTop: 0,
  sectionHeaderGap: Space.s12,
  /** Small gap between search bar and first section header on tab screens. */
  searchToSection: Space.s12,
  cardGap: Space.s12,
  listItemGap: Space.s8,
  titleSubtitleGap: Space.s4,
  iconRailWidth: Space.s24,
  tabBarSafe: Space.s24,
  cardRadius: Space.s16,
  featuredCardHeight: 176,
  cardBorder: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  cardBorderThin: `rgba(201, 147, 58, 0.08)`,
  listAccentBorder: 2,
  listContentInset: Space.s12,
  badgeSize: Space.s12,
  thumbnailSize: 56,
  miniPlayerHeight: 64,
  searchBarHeight: 42,
} as const;

/** Theme-aware layout tokens derived from the active palette. */
export function getLayoutTokens(palette: AppPalette) {
  return {
    ...Layout,
    cardBorder: palette.cardBorder,
    cardBorderThin: palette.cardBorder,
  };
}

/** Serif family for ceremonial headers and page titles. */
export const SerifFamily = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

const CEREMONIAL_SECTION_FONT_SIZE = 20;
const MINI_SECTION_FONT_SIZE = 14;

/** Engraved chapter-heading style — serif small-caps, tight tracking, primary text color. */
export function getCeremonialSectionHeaderStyle(textColor: string) {
  return {
    fontFamily: SerifFamily,
    fontSize: CEREMONIAL_SECTION_FONT_SIZE,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: CEREMONIAL_SECTION_FONT_SIZE * 0.012,
    color: textColor,
    ...Platform.select({
      ios: { fontVariant: ['small-caps' as const], textTransform: 'none' as const },
      default: { textTransform: 'uppercase' as const },
    }),
  };
}

/** Shelf / catalog mini-headers (Prayer, Scripture, chapters) — same ceremonial voice, smaller. */
export function getMiniSectionHeaderStyle(textColor: string) {
  return {
    ...getCeremonialSectionHeaderStyle(textColor),
    fontSize: MINI_SECTION_FONT_SIZE,
    lineHeight: 18,
    letterSpacing: MINI_SECTION_FONT_SIZE * 0.012,
  };
}

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
  },
};

export const Animation = {
  pressSpring: { damping: 18, stiffness: 420, mass: 0.45 },
  pressScale: 0.98,
  pressOpacity: 0.92,
  pressDuration: 120,
  verseEnterMs: 300,
  verseEnterLift: 8,
  tabMedallionMs: 150,
  tabFadeMs: 200,
  detailSlideMs: 350,
};

function buildThemeColors(palette: AppPalette) {
  return {
    text: palette.text,
    background: palette.background,
    tint: palette.gold,
    accent: palette.crimson,
    muted: palette.muted,
    seeAll: palette.mutedGold,
    icon: palette.muted,
    tabIconDefault: palette.muted,
    tabIconSelected: palette.gold,
    cardBackground: palette.card,
  };
}

export const Colors = {
  light: buildThemeColors(PaletteLight),
  dark: buildThemeColors(PaletteDark),
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
