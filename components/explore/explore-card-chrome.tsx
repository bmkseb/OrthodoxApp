import React, { useMemo, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlossyCardGradientFill } from '@/components/ui/glossy-card-gradient-fill';
import { Layout, SerifFamily, getExploreCardBorder, getExploreCardOutline, type AppPalette, type ColorScheme } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

export type ExploreCardGlow = 'standard' | 'emphasis';

const serifSmallCaps = Platform.select({
  ios: { fontVariant: ['small-caps' as const], textTransform: 'none' as const },
  default: { textTransform: 'uppercase' as const },
});

function exploreCardBorder(palette: AppPalette, colorScheme: ColorScheme) {
  return getExploreCardBorder(palette, colorScheme);
}

function exploreCardShadow(
  palette: { shadowColor: string },
  colorScheme: ColorScheme,
  level: ExploreCardGlow
) {
  const emphasis = level === 'emphasis';
  return Platform.select({
    ios: {
      shadowColor: palette.shadowColor,
      shadowOffset: { width: 0, height: emphasis ? 3 : 2 },
      shadowOpacity: colorScheme === 'light' ? (emphasis ? 0.08 : 0.06) : emphasis ? 0.32 : 0.26,
      shadowRadius: emphasis ? 14 : 10,
    },
    android: { elevation: emphasis ? 3 : 2 },
  });
}

/** Shared Explore tab card chrome — border, fill, and soft gold glow. */
export function useExploreCardChrome() {
  const { palette, colorScheme } = useThemeTokens();

  return useMemo(
    () =>
      StyleSheet.create({
        outline: {
          borderRadius: Layout.cardRadius + 1,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: getExploreCardOutline(colorScheme),
        },
        surface: {
          borderRadius: Layout.cardRadius,
          borderWidth: 1,
          borderColor: exploreCardBorder(palette, colorScheme),
          backgroundColor: 'transparent',
          overflow: 'hidden',
          ...exploreCardShadow(palette, colorScheme, 'standard'),
        },
      }),
    [colorScheme, palette]
  );
}

type ExploreCardSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ExploreCardSurface({ children, style }: ExploreCardSurfaceProps) {
  const chrome = useExploreCardChrome();

  return (
    <View style={chrome.outline}>
      <View style={chrome.surface}>
        <GlossyCardGradientFill />
        <View style={[contentLayer, style]}>{children}</View>
      </View>
    </View>
  );
}

const contentLayer = { zIndex: 1, position: 'relative' as const } as const;

/** Shared Explore card type — Quick Access, Weekly Explore, etc. */
export function useExploreCardTypography() {
  const { palette } = useThemeTokens();

  return useMemo(
    () =>
      StyleSheet.create({
        eyebrow: {
          fontFamily: SerifFamily,
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 1.3,
          color: palette.muted,
          ...serifSmallCaps,
        },
        title: {
          fontFamily: SerifFamily,
          fontSize: 15.5,
          fontWeight: '700',
          lineHeight: 20,
          letterSpacing: -0.15,
          color: palette.text,
        },
        subtitle: {
          fontFamily: SerifFamily,
          fontSize: 12,
          fontWeight: '400',
          lineHeight: 17,
          color: palette.muted,
        },
        accent: {
          fontFamily: SerifFamily,
          fontSize: 12,
          fontWeight: '400',
          lineHeight: 17,
          color: palette.muted,
        },
        headline: {
          fontFamily: SerifFamily,
          fontSize: 17,
          fontWeight: '700',
          lineHeight: 22,
          letterSpacing: -0.25,
          color: palette.text,
        },
        label: {
          fontFamily: SerifFamily,
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
          color: palette.muted,
        },
        meta: {
          fontFamily: SerifFamily,
          fontSize: 11,
          fontWeight: '600',
          color: palette.muted,
        },
      }),
    [palette]
  );
}
