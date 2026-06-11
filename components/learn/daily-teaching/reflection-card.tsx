import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type DailyTeachingReflectionCardProps = {
  label: string;
  question: string;
};

export function DailyTeachingReflectionCard({ label, question }: DailyTeachingReflectionCardProps) {
  return (
    <RadialCardSurface tint="neutral" style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Icon name="sparkle" size={16} color={Palette.mutedGold} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.question}>{question}</Text>
      </View>
    </RadialCardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Space.s24,
  },
  inner: {
    padding: Space.s16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    marginBottom: Space.s12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.muted,
  },
  question: {
    fontSize: 17,
    lineHeight: 27,
    color: Palette.text,
    fontWeight: '500',
  },
});
