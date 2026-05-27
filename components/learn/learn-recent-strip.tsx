import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type RecentItem = {
  id: string;
  title: string;
  collection: string;
};

type LearnRecentStripProps = {
  items: RecentItem[];
  onPress?: (id: string) => void;
};

export function LearnRecentStrip({ items, onPress }: LearnRecentStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}>
      {items.map((item) => (
        <OrthodoxPressable
          key={item.id}
          style={styles.chip}
          onPress={() => onPress?.(item.id)}
          accessibilityRole="button">
          <ThemedText style={styles.chipTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.chipSub} numberOfLines={1}>
            {item.collection}
          </ThemedText>
        </OrthodoxPressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: Spacing.sm,
    paddingRight: Layout.pagePadding,
  },
  chip: {
    width: 140,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    backgroundColor: 'rgba(37, 32, 24, 0.65)',
    gap: 3,
  },
  chipTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.text,
  },
  chipSub: {
    fontSize: 10,
    color: Palette.muted,
  },
});
