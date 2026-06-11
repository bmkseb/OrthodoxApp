import { StyleSheet, Text, View } from 'react-native';

import { FastDayUnderline } from '@/components/calendar/fast-day-underline';
import { CALENDAR_VISUAL } from '@/lib/calendar-visual';
import { BorderRadius, Palette } from '@/constants/theme';

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
  const isFasting = fastWeekday || fastSeason;
  const fastLevel = fastSeason ? 'seasonal' : 'weekday';

  return (
    <View
      style={[
        styles.cell,
        selected && styles.selectedCell,
        todayOnCell && !selected && styles.todayCellRing,
        feastBg ? { backgroundColor: feastBg } : null,
      ]}>
      <View style={[styles.dayBox, today && !todayOnCell && !selected && styles.todayRing]}>
        <View style={styles.dateStack}>
          <Text
            style={[
              styles.gregorian,
              selected && styles.selectedText,
              today && !selected && styles.todayText,
              isFasting && !selected && !today && styles.fastText,
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
            selected && styles.selectedText,
            today && !selected && styles.todayText,
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
  selectedCell: {
    borderColor: CALENDAR_VISUAL.selectedCellBorder,
    backgroundColor: CALENDAR_VISUAL.selectedCellBg,
  },
  todayCellRing: {
    borderColor: CALENDAR_VISUAL.todayCellBorder,
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
  todayRing: {
    borderWidth: 1.5,
    borderColor: CALENDAR_VISUAL.todayCellBorder,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  gregorian: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 17,
  },
  ethiopian: {
    fontSize: 9,
    fontWeight: '500',
    color: Palette.muted,
    lineHeight: 11,
    marginTop: 3,
  },
  todayText: {
    color: Palette.mutedGold,
  },
  fastText: {
    color: Palette.gold,
  },
  selectedText: {
    color: CALENDAR_VISUAL.fastLineActive,
    fontWeight: '700',
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
