import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ExploreCardSurface } from '@/components/explore/explore-card-chrome';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Spacing } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type LearnTeachingCardProps = {
  label: string;
  title: string;
  readMin?: number;
  onPress?: () => void;
};

export function LearnTeachingCard({ label, title, readMin, onPress }: LearnTeachingCardProps) {
  const { palette } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: Layout.sectionHeaderGap,
        },
        card: {
          minHeight: 88,
        },
        content: {
          padding: Spacing.md,
          paddingRight: 40,
          gap: 4,
        },
        label: {
          fontSize: 10,
          fontWeight: '500',
          color: palette.mutedGold,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        },
        title: {
          fontSize: 17,
          fontWeight: '600',
          color: palette.text,
          letterSpacing: -0.25,
          lineHeight: 22,
        },
        meta: { fontSize: 11, color: palette.muted },
        cross: {
          position: 'absolute',
          right: 14,
          bottom: 12,
          fontSize: 12,
          color: `${palette.gold}40`,
        },
      }),
    [palette]
  );

  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <ExploreCardSurface style={styles.card}>
        <View style={styles.content}>
          <ThemedText style={styles.label}>{label}</ThemedText>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          {readMin ? <ThemedText style={styles.meta}>{readMin} min</ThemedText> : null}
        </View>
        <Text style={styles.cross}>☩</Text>
      </ExploreCardSurface>
    </OrthodoxPressable>
  );
}
