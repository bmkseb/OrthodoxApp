import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';

type PrayerStreakCardProps = {
  title: string;
  subtitle: string;
};

/** Compact, personal hero for the Explore tab — a reason to come back daily. */
export const PrayerStreakCard = memo(function PrayerStreakCard({
  title,
  subtitle,
}: PrayerStreakCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.flameBadge}>
        <Icon name="flame" size={26} color={Palette.gold} />
      </View>
      <View style={styles.text}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText type="muted" style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s16,
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    backgroundColor: Palette.surface,
    paddingHorizontal: Space.s16,
    paddingVertical: Space.s16,
    // Subtle gold glow
    shadowColor: Palette.gold,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  flameBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Palette.muted,
  },
});
