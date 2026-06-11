import { memo, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { ExploreCardSurface, useExploreCardTypography } from '@/components/explore/explore-card-chrome';
import { Space, getGlossyCardBackground } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type PrayerStreakCardProps = {
  title: string;
  subtitle: string;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function todayMondayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

function weekDayNumbers(): number[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayMondayIndex());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

export const PrayerStreakCard = memo(function PrayerStreakCard({
  title,
  subtitle,
}: PrayerStreakCardProps) {
  const { palette, colorScheme, sacred } = useThemeTokens();
  const type = useExploreCardTypography();
  const todayIndex = todayMondayIndex();
  const dayNumbers = weekDayNumbers();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          paddingHorizontal: Space.s16,
          paddingVertical: Space.s16,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Space.s12,
        },
        crossBadge: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sacred.medallionFill,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: sacred.medallionRing,
        },
        text: {
          flex: 1,
          minWidth: 0,
          gap: 1,
        },
        weekRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: Space.s12,
          paddingTop: Space.s12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: palette.border,
        },
        dayCol: {
          alignItems: 'center',
          gap: Space.s4 + 1,
        },
        dot: {
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.border,
          backgroundColor: getGlossyCardBackground(palette, colorScheme, 'deep'),
        },
        dotDone: {
          borderWidth: 1.5,
          borderColor: palette.border,
        },
        dotToday: {
          borderWidth: 1.5,
          borderColor: sacred.medallionRing,
          backgroundColor: sacred.medallionFill,
          ...Platform.select({
            ios: {
              shadowColor: palette.shadowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: { elevation: 2 },
          }),
        },
        dotNumberActive: {
          color: palette.text,
        },
        dayLabelActive: {
          color: palette.text,
          fontWeight: '700',
        },
      }),
    [colorScheme, palette, sacred]
  );

  return (
    <ExploreCardSurface>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.crossBadge}>
            <Icon name="cross" size={18} color={palette.mutedGold} />
          </View>
          <View style={styles.text}>
            <ThemedText style={type.headline}>{title}</ThemedText>
            <ThemedText style={type.subtitle} numberOfLines={2}>
              {subtitle}
            </ThemedText>
          </View>
        </View>

        <View style={styles.weekRow}>
          {DAY_LABELS.map((label, i) => {
            const completed = i < todayIndex;
            const isToday = i === todayIndex;
            return (
              <View key={label} style={styles.dayCol}>
                <View
                  style={[
                    styles.dot,
                    completed && styles.dotDone,
                    isToday && styles.dotToday,
                  ]}>
                  <ThemedText
                    style={[
                      type.meta,
                      (completed || isToday) && styles.dotNumberActive,
                    ]}>
                    {dayNumbers[i]}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[type.label, (completed || isToday) && styles.dayLabelActive]}>
                  {label}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    </ExploreCardSurface>
  );
});
