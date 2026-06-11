import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';
import {
  formatEthiopianDateLong,
  formatEvangelistYearLabel,
  formatGregorianDateLong,
} from '@/lib/calendar-i18n';
import { getDayInfo, getEvangelistYear } from '@/lib/eotc-liturgical-calendar';
import { Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type TodayHeaderProps = {
  date?: Date;
  todayLabel?: string;
};

export function TodayHeader({ date = new Date(), todayLabel = 'Today' }: TodayHeaderProps) {
  const { mode } = useTranslation();
  const { palette } = useThemeTokens();
  const info = getDayInfo(date);
  const evangelist = getEvangelistYear(info.ethiopianDate.year);

  return (
    <View style={[styles.wrap, { borderBottomColor: palette.border }]}>
      <Text style={[styles.todayLabel, { color: palette.text }]}>{todayLabel}</Text>
      <View style={styles.dates}>
        <Text style={[styles.gregorianDate, { color: palette.text }]}>
          {formatGregorianDateLong(date, mode)}
        </Text>
        <Text style={[styles.ethiopianDate, { color: palette.muted }]} numberOfLines={2}>
          {formatEthiopianDateLong(info.ethiopianDate, mode)}
          <Text style={{ color: palette.muted }}> · </Text>
          {formatEvangelistYearLabel(evangelist, mode)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Space.s12,
    marginBottom: Space.s12,
    paddingBottom: Space.s8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  dates: {
    flex: 1,
    alignItems: 'flex-end',
    gap: Space.s4,
  },
  gregorianDate: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  ethiopianDate: {
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 17,
  },
});
