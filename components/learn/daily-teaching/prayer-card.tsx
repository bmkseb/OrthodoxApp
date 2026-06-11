import { StyleSheet, Text, View } from 'react-native';

import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type DailyTeachingPrayerCardProps = {
  label: string;
  prayer: string;
};

export function DailyTeachingPrayerCard({ label, prayer }: DailyTeachingPrayerCardProps) {
  return (
    <RadialCardSurface tint="cool" style={styles.card}>
      <View style={styles.inner}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.prayer}>{prayer}</Text>
      </View>
    </RadialCardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.16)',
    marginBottom: Space.s24,
  },
  inner: {
    padding: Space.s16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: Space.s12,
  },
  prayer: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(244, 236, 216, 0.9)',
    fontStyle: 'italic',
  },
});
