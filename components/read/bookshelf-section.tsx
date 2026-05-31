import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Layout } from '@/constants/theme';

const SHELF_BG = '#1C1008';
const WOOD_LIGHT = '#2C1A0E';
const WOOD_DARK = '#1A0F07';
const LEDGE_GOLD = 'rgba(201, 150, 58, 0.4)';

const GRAIN_LINES = 16;

function WoodGrainOverlay() {
  return (
    <View style={styles.grainWrap} pointerEvents="none">
      {Array.from({ length: GRAIN_LINES }, (_, index) => (
        <View
          key={index}
          style={[
            styles.grainLine,
            {
              left: (index / GRAIN_LINES) * 100 + '%',
              opacity: index % 2 === 0 ? 0.07 : 0.04,
            },
          ]}
        />
      ))}
    </View>
  );
}

type BookshelfSectionProps = {
  children: ReactNode;
  /** When true, wraps children in a horizontal ScrollView. */
  horizontal?: boolean;
  scrollProps?: ScrollViewProps;
};

/** Warm wooden shelf backdrop for portrait book cards on the Read screen. */
export function BookshelfSection({ children, horizontal = false, scrollProps }: BookshelfSectionProps) {
  const content = horizontal ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      {...scrollProps}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <View style={styles.outer}>
      <LinearGradient colors={[WOOD_LIGHT, WOOD_DARK]} style={styles.shelf}>
        <WoodGrainOverlay />
        <View style={styles.cardArea}>{content}</View>
        <View style={styles.ledge} />
        <View style={styles.depth} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: -Layout.pagePadding,
    backgroundColor: SHELF_BG,
  },
  shelf: {
    paddingHorizontal: Layout.pagePadding,
    paddingTop: 14,
    overflow: 'hidden',
  },
  grainWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  grainLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#000',
  },
  cardArea: {
    minHeight: 165,
  },
  rail: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
  },
  ledge: {
    height: 2.5,
    marginTop: 2,
    backgroundColor: LEDGE_GOLD,
    borderRadius: 1,
  },
  depth: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
});
