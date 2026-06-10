import { StyleSheet, Text, View } from 'react-native';

import { CALENDAR_VISUAL } from '@/lib/calendar-visual';
import { BorderRadius, Palette } from '@/constants/theme';

type CalendarLegendPreviewProps = {
  feastBg?: string;
  dotColor?: string;
  today?: boolean;
  fastColumn?: boolean;
  fastSeason?: boolean;
  dayLabel?: string;
  ethiopianLabel?: string;
  todayOnCell?: boolean;
};

export function CalendarLegendPreview({
  feastBg,
  dotColor,
  today = false,
  fastColumn = false,
  fastSeason = false,
  dayLabel = '7',
  ethiopianLabel = '7',
  todayOnCell = false,
}: CalendarLegendPreviewProps) {
  return (
    <View
      style={[
        styles.cell,
        todayOnCell && styles.todayCellRing,
        fastColumn && styles.fastColumn,
        fastSeason && !feastBg && styles.fastSeasonCell,
        feastBg ? { backgroundColor: feastBg } : null,
      ]}>
      <View style={[styles.dayBox, today && !todayOnCell && styles.todayRing]}>
        <Text style={[styles.gregorian, today && styles.todayText]}>{dayLabel}</Text>
        <Text style={[styles.ethiopian, today && styles.todayText]} numberOfLines={1}>
          {ethiopianLabel}
        </Text>
        {dotColor || fastSeason ? (
          <View style={styles.dotSlot}>
            {dotColor ? (
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
            ) : (
              <View style={styles.fastMarker} />
            )}
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
  },
  todayCellRing: {
    borderWidth: 1.5,
    borderColor: CALENDAR_VISUAL.todayRing,
    borderRadius: BorderRadius.sm,
  },
  fastColumn: {
    backgroundColor: CALENDAR_VISUAL.fastColumn,
    borderRadius: BorderRadius.sm,
  },
  fastSeasonCell: {
    backgroundColor: CALENDAR_VISUAL.fastSeasonFill,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: CALENDAR_VISUAL.fastSeasonBorder,
  },
  dayBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  todayRing: {
    borderWidth: 1.5,
    borderColor: CALENDAR_VISUAL.todayRing,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  gregorian: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 18,
  },
  ethiopian: {
    fontSize: 9,
    fontWeight: '500',
    color: Palette.muted,
    lineHeight: 11,
    marginTop: 2,
  },
  todayText: {
    color: CALENDAR_VISUAL.dotGold,
  },
  dotSlot: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  fastMarker: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: CALENDAR_VISUAL.fastSeasonMarker,
  },
});
