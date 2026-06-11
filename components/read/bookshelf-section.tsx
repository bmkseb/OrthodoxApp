import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Layout } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type BookshelfSectionProps = {
  children: ReactNode;
  /** When true, wraps children in a horizontal ScrollView. */
  horizontal?: boolean;
  /** Vertical saved/catalog list — recessed panel without book-rail min height. */
  list?: boolean;
  scrollProps?: ScrollViewProps;
};

/**
 * Subtle recessed shelf for portrait book cards on the Read screen.
 * Adapts gradient, ledge, and depth to light/dark theme.
 */
export function BookshelfSection({
  children,
  horizontal = false,
  list = false,
  scrollProps,
}: BookshelfSectionProps) {
  const { palette, sacred, colorScheme } = useThemeTokens();
  const { contentContainerStyle: scrollContentStyle, ...restScrollProps } = scrollProps ?? {};

  const shelfColors: [string, string] =
    colorScheme === 'light'
      ? [sacred.functionalWarm, palette.background]
      : [palette.background, palette.backgroundDeep];
  const depthColors =
    colorScheme === 'light'
      ? (['rgba(0, 0, 0, 0.05)', 'transparent'] as const)
      : (['rgba(0, 0, 0, 0.22)', 'transparent'] as const);

  const content = horizontal ? (
    <AnimatedScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={[styles.rail, scrollContentStyle]}
      {...restScrollProps}>
      {children}
    </AnimatedScrollView>
  ) : (
    children
  );

  return (
    <View
      style={[
        styles.outer,
        {
          borderColor: palette.border,
          backgroundColor: colorScheme === 'light' ? sacred.functionalWarm : palette.backgroundDeep,
        },
      ]}>
      <LinearGradient colors={shelfColors} style={[styles.shelf, list && styles.shelfList]}>
        <View style={[styles.cardArea, list && styles.listArea]}>{content}</View>
        <View style={[styles.ledge, { backgroundColor: sacred.tabBarHairline }]} />
        <LinearGradient colors={[...depthColors]} style={[styles.depth, list && styles.depthList]} pointerEvents="none" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: -Layout.pagePadding,
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  shelf: {
    paddingHorizontal: Layout.pagePadding,
    paddingTop: 14,
    overflow: 'hidden',
  },
  shelfList: {
    paddingTop: 10,
    paddingBottom: 2,
  },
  cardArea: {
    minHeight: 142,
  },
  listArea: {
    minHeight: 0,
    paddingVertical: 4,
  },
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
  },
  ledge: {
    height: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  depth: {
    height: 10,
  },
  depthList: {
    height: 8,
  },
});
