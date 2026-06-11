import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Spacing, getGlossyCardBackground } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

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
  const { palette, colorScheme } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          borderColor: `${palette.gold}33`,
          backgroundColor: getGlossyCardBackground(palette, colorScheme),
          gap: 3,
        },
        chipTitle: {
          fontSize: 13,
          fontWeight: '500',
          color: palette.text,
        },
        chipSub: {
          fontSize: 10,
          color: palette.muted,
        },
      }),
    [colorScheme, palette]
  );

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
