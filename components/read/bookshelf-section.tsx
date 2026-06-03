import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Layout, Palette } from '@/constants/theme';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const LEDGE_GOLD = 'rgba(201, 147, 58, 0.28)';

type BookshelfSectionProps = {
  children: ReactNode;
  /** When true, wraps children in a horizontal ScrollView. */
  horizontal?: boolean;
  /** Vertical saved/catalog list — recessed panel without book-rail min height. */
  list?: boolean;
  scrollProps?: ScrollViewProps;
};

/**
 * Subtle recessed shelf for portrait book cards on the Read screen. Reads as a
 * gentle niche that matches the dark, warm theme — a thin gold ledge plus a soft
 * shadow keep the "shelf" feel without a literal wood texture.
 */
export function BookshelfSection({
  children,
  horizontal = false,
  list = false,
  scrollProps,
}: BookshelfSectionProps) {
  const { contentContainerStyle: scrollContentStyle, ...restScrollProps } = scrollProps ?? {};

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
    <View style={styles.outer}>
      <LinearGradient
        colors={[Palette.background, Palette.backgroundDeep]}
        style={[styles.shelf, list && styles.shelfList]}>
        <View style={[styles.cardArea, list && styles.listArea]}>{content}</View>
        <View style={styles.ledge} />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.22)', 'transparent']}
          style={[styles.depth, list && styles.depthList]}
          pointerEvents="none"
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: -Layout.pagePadding,
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
    backgroundColor: LEDGE_GOLD,
  },
  depth: {
    height: 10,
  },
  depthList: {
    height: 8,
  },
});
