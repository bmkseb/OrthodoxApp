import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SacredImage } from '@/components/sacred/sacred-image';
import { OrthodoxPressable } from '@/components/ui/orthodox-pressable';
import { Layout, Palette } from '@/constants/theme';
import {
  CalendarEvent,
  getStableFeastId,
  getUpcomingMajorFeasts,
} from '@/data/orthodoxCalendar';
import { useTranslation } from '@/hooks/use-translation';

type UpcomingFeastsProps = {
  onPressFeast: (event: CalendarEvent) => void;
};

function formatFeastDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntil(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function UpcomingFeastsComponent({ onPressFeast }: UpcomingFeastsProps) {
  const { t } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const feasts = useMemo(() => getUpcomingMajorFeasts(today, 5), [today]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {feasts.map((feast) => {
        const remaining = daysUntil(today, feast.date);
        const stableId = getStableFeastId(feast);

        return (
          <OrthodoxPressable key={stableId} onPress={() => onPressFeast(feast)}>
            <View style={styles.card}>
              <SacredImage source={feast.image ?? ''} style={styles.cardImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.cardGradient}
              />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {feast.nameEn}
                </Text>
                <Text style={styles.cardDate}>{formatFeastDate(feast.date)}</Text>
                <Text style={styles.cardRemaining}>
                  {t('calendar.daysRemaining', { count: remaining })}
                </Text>
              </View>
            </View>
          </OrthodoxPressable>
        );
      })}
    </ScrollView>
  );
}

export const UpcomingFeasts = memo(UpcomingFeastsComponent);

const styles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingRight: Layout.pagePadding,
  },
  card: {
    width: 140,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Palette.card,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardText: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  cardTitle: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDate: {
    color: Palette.gold,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  cardRemaining: {
    color: 'rgba(201, 147, 58, 0.7)',
    fontSize: 11,
    fontWeight: '400',
  },
});
