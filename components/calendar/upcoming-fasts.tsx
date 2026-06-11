import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/components/ui/section-header';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { SEASONS } from '@/lib/calendar-content';
import type { UpcomingFastPeriod } from '@/lib/eotc-liturgical-calendar';
import { Layout, Space, getGlossyCardBackground } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type UpcomingFastsProps = {
  fasts: UpcomingFastPeriod[];
  /** When true, omits header (parent SectionBlock owns rhythm). */
  contentOnly?: boolean;
};

export const UpcomingFasts = memo(function UpcomingFasts({ fasts, contentOnly = false }: UpcomingFastsProps) {
  const { t } = useTranslation();
  const { palette, colorScheme } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: 0,
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
          backgroundColor: getGlossyCardBackground(palette, colorScheme),
          borderWidth: StyleSheet.hairlineWidth,
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
          color: palette.text,
          marginTop: Space.s4,
          marginBottom: 2,
        },
        nameAm: {
          fontSize: 12,
          color: palette.muted,
          marginBottom: Space.s8,
        },
        dates: {
          fontSize: 12,
          color: palette.gold,
          marginBottom: 4,
        },
        remaining: {
          fontSize: 11,
        },
      }),
    [colorScheme, palette]
  );

  if (fasts.length === 0) return null;

  const list = (
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
  );

  if (contentOnly) return list;

  return (
    <View style={styles.wrap}>
      <SectionHeader headerKey="upcomingFasts" />
      {list}
    </View>
  );
});
