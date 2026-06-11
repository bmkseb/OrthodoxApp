import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FastDayUnderline } from '@/components/calendar/fast-day-underline';
import { getCalendarVisual } from '@/lib/calendar-visual';
import { BorderRadius } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type CalendarLegendPreviewProps = {
  feastBg?: string;
  dotColor?: string;
  today?: boolean;
  selected?: boolean;
  fastWeekday?: boolean;
  fastSeason?: boolean;
  dayLabel?: string;
  ethiopianLabel?: string;
  todayOnCell?: boolean;
};

export function CalendarLegendPreview({
  feastBg,
  dotColor,
  today = false,
  selected = false,
  fastWeekday = false,
  fastSeason = false,
  dayLabel = '7',
  ethiopianLabel = '7',
  todayOnCell = false,
}: CalendarLegendPreviewProps) {
  const { palette, colorScheme } = useThemeTokens();
  const visual = useMemo(
    () => getCalendarVisual(palette, colorScheme),
    [colorScheme, palette]
  );
  const isFasting = fastWeekday || fastSeason;
  const fastLevel = fastSeason ? 'seasonal' : 'weekday';

  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        selectedCell: {
          borderColor: visual.selectedCellBorder,
          backgroundColor: visual.selectedCellBg,
        },
        todayCellRing: {
          borderColor: visual.todayCellBorder,
        },
        todayRing: {
          borderWidth: 1.5,
          borderColor: visual.todayCellBorder,
          borderRadius: 4,
          paddingHorizontal: 4,
          paddingBottom: 2,
        },
        gregorian: { color: palette.text },
        ethiopian: { color: palette.muted },
        todayText: { color: palette.mutedGold },
        fastText: { color: palette.gold },
        selectedText: { color: visual.fastLineActive, fontWeight: '700' },
      }),
    [palette, visual]
  );

  return (
    <View
      style={[
        styles.cell,
        selected && dynamic.selectedCell,
        todayOnCell && !selected && dynamic.todayCellRing,
        feastBg ? { backgroundColor: feastBg } : null,
      ]}>
      <View style={[styles.dayBox, today && !todayOnCell && !selected && dynamic.todayRing]}>
        <View style={styles.dateStack}>
          <Text
            style={[
              styles.gregorian,
              dynamic.gregorian,
              selected && dynamic.selectedText,
              today && !selected && dynamic.todayText,
              isFasting && !selected && !today && dynamic.fastText,
            ]}>
            {dayLabel}
          </Text>
          {isFasting ? (
            <FastDayUnderline level={fastLevel} selected={selected} animate={false} />
          ) : null}
        </View>
        <Text
          style={[
            styles.ethiopian,
            dynamic.ethiopian,
            selected && dynamic.selectedText,
            today && !selected && dynamic.todayText,
          ]}
          numberOfLines={1}>
          {ethiopianLabel}
        </Text>
        {dotColor ? (
          <View style={styles.dotSlot}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 48,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingBottom: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dateStack: {
    alignItems: 'center',
    minHeight: 23,
  },
  gregorian: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 17,
  },
  ethiopian: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 11,
    marginTop: 3,
  },
  dotSlot: {
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
