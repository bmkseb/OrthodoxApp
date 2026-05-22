import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Spacing } from '@/constants/theme';

type DevotionalProgressCardProps = {
  streakDays: number;
  totalDays?: number;
  subtitle?: string;
};

export const DevotionalProgressCard = memo(function DevotionalProgressCard({
  streakDays,
  totalDays = 7,
  subtitle = 'Daily devotion builds spiritual rhythm',
}: DevotionalProgressCardProps) {
  return (
    <RadialCardSurface style={styles.surface}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Icon name="flame" size={20} />
          <ThemedText style={styles.streakText}>
            {streakDays} Day Streak
          </ThemedText>
        </View>

        <View style={styles.beads}>
          {Array.from({ length: totalDays }).map((_, index) => {
            const isComplete = index < streakDays;
            return (
              <View
                key={index}
                style={[styles.bead, isComplete ? styles.beadComplete : styles.beadIncomplete]}>
                <Text style={[styles.beadCross, isComplete ? styles.beadCrossComplete : styles.beadCrossIncomplete]}>
                  †
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <ThemedText type="muted" style={styles.subtitle}>
        {subtitle}
      </ThemedText>
    </RadialCardSurface>
  );
});

const styles = StyleSheet.create({
  surface: {
    marginBottom: Layout.sectionGap,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
  },
  beads: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  beadComplete: {
    borderColor: Palette.gold,
    backgroundColor: 'rgba(201, 147, 58, 0.15)',
  },
  beadIncomplete: {
    borderColor: 'rgba(201, 147, 58, 0.25)',
    backgroundColor: 'transparent',
  },
  beadCross: {
    fontSize: 10,
    lineHeight: 12,
  },
  beadCrossComplete: {
    color: Palette.gold,
    opacity: 1,
  },
  beadCrossIncomplete: {
    color: Palette.gold,
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 12,
  },
});
