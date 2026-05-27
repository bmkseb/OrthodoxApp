import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type LearnTeachingCardProps = {
  label: string;
  title: string;
  readMin?: number;
  onPress?: () => void;
};

export function LearnTeachingCard({ label, title, readMin, onPress }: LearnTeachingCardProps) {
  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <LinearGradient
        colors={['rgba(42, 36, 28, 0.9)', 'rgba(22, 19, 16, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.title} numberOfLines={2}>
          {title}
        </ThemedText>
        {readMin ? <ThemedText style={styles.meta}>{readMin} min</ThemedText> : null}
      </View>
      <Text style={styles.cross}>☩</Text>
    </OrthodoxPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    overflow: 'hidden',
    minHeight: 88,
    marginBottom: Layout.sectionHeaderGap,
  },
  content: {
    padding: Spacing.md,
    paddingRight: 40,
    zIndex: 1,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Palette.mutedGold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.25,
    lineHeight: 22,
  },
  meta: { fontSize: 11, color: Palette.muted },
  cross: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    fontSize: 12,
    color: 'rgba(201, 147, 58, 0.25)',
  },
});
