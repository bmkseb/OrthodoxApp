import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { useTranslation } from '@/hooks/use-translation';
import { SEASONS } from '@/lib/calendar-content';
import { seasonBannerLabels } from '@/lib/calendar-i18n';
import { getSeasonBannerMeta, type SeasonBannerSubtitle } from '@/lib/eotc-liturgical-calendar';
import type { TranslationKey } from '@/lib/translations';
import { BorderRadius, Opacity, Palette, Space } from '@/constants/theme';

const BANNER_GRADIENT = ['#3A2F28', '#2A221C', '#1C1712'] as const;

type SeasonBannerProps = {
  date?: Date;
  onOpenLegend?: () => void;
};

function formatBannerSubtitle(
  subtitle: SeasonBannerSubtitle,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  switch (subtitle.kind) {
    case 'fast':
      return t('calendar.fastDayProgress', { total: subtitle.total, current: subtitle.current });
    case 'season':
      return t('calendar.seasonDayProgress', { total: subtitle.total, current: subtitle.current });
    case 'nineveh':
      return t('calendar.ninevehSubtitle');
    case 'holyWeek':
      return t('calendar.holyWeekSubtitle');
  }
}

export function SeasonBanner({ date = new Date(), onOpenLegend }: SeasonBannerProps) {
  const { t, mode } = useTranslation();
  const meta = getSeasonBannerMeta(date);
  const season = SEASONS[meta.bannerSeason];
  const accent = meta.activeFastSeason ? SEASONS[meta.activeFastSeason].color : season.color;
  const labels = seasonBannerLabels(season, mode);

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...BANNER_GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />

        <View style={styles.body}>
          <View style={styles.copy}>
            <Text style={styles.seasonName}>{labels.primary}</Text>
            {labels.secondary ? (
              <Text style={styles.seasonAlias}>{labels.secondary}</Text>
            ) : null}
            {meta.subtitle ? (
              <Text style={styles.subtitle}>{formatBannerSubtitle(meta.subtitle, t)}</Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            {onOpenLegend ? (
              <OrthodoxPressable
                onPress={onOpenLegend}
                style={styles.infoBtn}
                accessibilityLabel={t('calendar.infoAccessibility')}>
                <Text style={styles.infoIcon}>ⓘ</Text>
              </OrthodoxPressable>
            ) : null}
            {meta.showFastingBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('calendar.fasting')}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  },
  gradient: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Space.s16,
    paddingHorizontal: Space.s16,
    paddingLeft: Space.s16,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.9,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Space.s12,
  },
  copy: {
    flex: 1,
    paddingRight: Space.s4,
  },
  seasonName: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  seasonAlias: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.gold,
    marginBottom: Space.s4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(244, 236, 216, 0.72)',
  },
  actions: {
    alignItems: 'flex-end',
    gap: Space.s8,
  },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(244, 236, 216, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(244, 236, 216, 0.92)',
    lineHeight: 18,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.text,
  },
});
