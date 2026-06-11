import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type DailyTeachingHeroProps = {
  eyebrow: string;
  title: string;
  dateLabel: string;
  category: string;
  readMin: number;
  completed?: boolean;
  readTimeLabel: string;
  completedLabel: string;
};

export function DailyTeachingHero({
  eyebrow,
  title,
  dateLabel,
  category,
  readMin,
  completed = false,
  readTimeLabel,
  completedLabel,
}: DailyTeachingHeroProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{dateLabel}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Icon name="sun" size={13} color={Palette.mutedGold} />
          <Text style={styles.metaText}>{readTimeLabel.replace('{{min}}', String(readMin))}</Text>
        </View>
        <View style={styles.metaChip}>
          <Icon name="scroll" size={13} color={Palette.mutedGold} />
          <Text style={styles.metaText}>{category}</Text>
        </View>
        {completed ? (
          <View style={[styles.metaChip, styles.completedChip]}>
            <Icon name="cross" size={13} color={Palette.gold} />
            <Text style={styles.completedText}>{completedLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: Space.s8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: Space.s8,
  },
  date: {
    fontSize: 14,
    color: Palette.muted,
    marginBottom: Space.s16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.s8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
    paddingHorizontal: Space.s12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.22)',
    backgroundColor: 'rgba(201, 147, 58, 0.06)',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.mutedGold,
  },
  completedChip: {
    borderColor: 'rgba(201, 147, 58, 0.35)',
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.gold,
  },
});
