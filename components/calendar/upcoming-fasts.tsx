import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { useTranslation } from '@/hooks/use-translation';
import { SEASONS } from '@/lib/calendar-content';
import type { UpcomingFastPeriod } from '@/lib/eotc-liturgical-calendar';
import { Layout, Palette, Space } from '@/constants/theme';

type UpcomingFastsProps = {
  fasts: UpcomingFastPeriod[];
};

export const UpcomingFasts = memo(function UpcomingFasts({ fasts }: UpcomingFastsProps) {
  const { t } = useTranslation();

  if (fasts.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <BilingualHeader headerKey="upcomingFasts" variant="section" />
        <Icon name="calendar" size={18} color={Palette.gold} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {fasts.map((fast) => {
          const season = SEASONS[fast.key];
          const startStr = fast.startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const endStr = fast.endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <View
              key={`${fast.key}-${fast.startDate.toISOString()}`}
              style={[styles.card, { borderColor: `${season.color}55` }]}>
              <View style={[styles.accent, { backgroundColor: season.color }]} />
              <Text style={styles.name} numberOfLines={2}>
                {fast.name}
              </Text>
              <Text style={styles.nameAm} numberOfLines={1}>
                {fast.nameAm}
              </Text>
              <Text style={styles.dates}>
                {startStr} – {endStr}
              </Text>
              <ThemedText type="muted" style={styles.remaining}>
                {fast.isActive
                  ? t('calendar.fastInProgress')
                  : t('calendar.daysRemaining', { count: fast.daysRemaining })}
              </ThemedText>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: Space.s24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.headerContentGap,
  },
  scroll: {
    gap: Layout.cardGap,
    paddingRight: Layout.pagePadding,
  },
  card: {
    width: 168,
    minHeight: 140,
    borderRadius: Layout.cardRadius,
    padding: Space.s12,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    marginTop: Space.s4,
    marginBottom: 2,
  },
  nameAm: {
    fontSize: 12,
    color: Palette.muted,
    marginBottom: Space.s8,
  },
  dates: {
    fontSize: 12,
    color: Palette.gold,
    marginBottom: 4,
  },
  remaining: {
    fontSize: 11,
  },
});
