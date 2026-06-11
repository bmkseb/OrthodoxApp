import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import { BorderRadius, Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

type DailyTeachingShelfProps = {
  title: string;
  category: string;
  dateLabel: string;
  readMin: number;
  completed?: boolean;
  onPress: () => void;
};

export function DailyTeachingShelf({
  title,
  category,
  dateLabel,
  readMin,
  completed = false,
  onPress,
}: DailyTeachingShelfProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <ShelfSubsectionHeader title={t('learn.dailyTeaching')} />

      <OrthodoxPressable onPress={onPress} style={styles.cardPress}>
        <RadialCardSurface tint="warm" style={styles.card}>
          <ManuscriptCornerFrame />
          <View style={styles.cardInner}>
            <View style={styles.topRow}>
              <Text style={styles.eyebrow}>{t('learn.dailyTeachingToday')}</Text>
              {completed ? (
                <View style={styles.doneBadge}>
                  <Icon name="cross" size={12} color={Palette.gold} />
                  <Text style={styles.doneText}>{t('learn.dailyCompleted')}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.date}>{dateLabel}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Icon name="sun" size={12} color={Palette.mutedGold} />
                <Text style={styles.metaText}>
                  {t('learn.dailyReadTime').replace('{{min}}', String(readMin))}
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Icon name="scroll" size={12} color={Palette.mutedGold} />
                <Text style={styles.metaText}>{category}</Text>
              </View>
            </View>

            <View style={styles.ctaRow}>
              <Text style={styles.cta}>{t('learn.dailyOpen')}</Text>
              <Icon name="chevron-right" size={16} color={Palette.gold} />
            </View>
          </View>
        </RadialCardSurface>
      </OrthodoxPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s16,
  },
  cardPress: {
    borderRadius: BorderRadius.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.24)',
  },
  cardInner: {
    padding: Space.s16,
    gap: Space.s8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s8,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Space.s8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
  },
  doneText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.gold,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: 13,
    color: Palette.muted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.s8,
    marginTop: Space.s4,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
    paddingHorizontal: Space.s8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.18)',
    backgroundColor: 'rgba(201, 147, 58, 0.05)',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.mutedGold,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.s8,
    paddingTop: Space.s12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(201, 147, 58, 0.18)',
  },
  cta: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.gold,
    letterSpacing: 0.2,
  },
});
