import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

type DevotionalProgressCardProps = {
  streakDays: number;
  totalDays?: number;
  subtitle?: string;
};

/** Calm prayer rhythm — not gamified streak UI. */
export const DevotionalProgressCard = memo(function DevotionalProgressCard({
  streakDays,
  totalDays = 7,
  subtitle = 'Daily devotion builds spiritual rhythm',
}: DevotionalProgressCardProps) {
  const progress = Math.min(Math.max(streakDays / totalDays, 0), 1);

  return (
    <View style={styles.surface}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>{streakDays} days of prayer</ThemedText>
        <Text style={styles.meta}>
          {streakDays}/{totalDays}
        </Text>
      </View>

      <View style={styles.rhythmTrack}>
        <View style={[styles.rhythmFill, { width: `${progress * 100}%` }]} />
        {Array.from({ length: totalDays }).map((_, index) => {
          const x = totalDays <= 1 ? 0 : (index / (totalDays - 1)) * 100;
          const filled = index < streakDays;
          return (
            <View
              key={index}
              style={[
                styles.marker,
                { left: `${x}%` },
                filled ? styles.markerFilled : styles.markerOpen,
              ]}>
              <Text style={[styles.markerGlyph, !filled && styles.markerGlyphMuted]}>✛</Text>
            </View>
          );
        })}
      </View>

      <ThemedText type="muted" style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  surface: {
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s16,
    gap: Space.s12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Space.s12,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: Palette.text,
    flex: 1,
  },
  meta: {
    ...Typography.metadata,
    color: Palette.muted,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  rhythmTrack: {
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'visible',
    justifyContent: 'center',
  },
  rhythmFill: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(201, 147, 58, 0.22)',
  },
  marker: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  markerFilled: {
    borderColor: 'rgba(201, 147, 58, 0.45)',
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
  },
  markerOpen: {
    borderColor: 'rgba(201, 147, 58, 0.12)',
    backgroundColor: 'transparent',
  },
  markerGlyph: {
    fontSize: 8,
    color: Palette.gold,
    lineHeight: 10,
  },
  markerGlyphMuted: {
    opacity: 0.35,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Palette.muted,
  },
});
