import { StyleSheet, Text, View } from 'react-native';

import { CALENDAR_VISUAL } from '@/lib/calendar-visual';
import { BorderRadius, Palette } from '@/constants/theme';

type CalendarLegendPreviewProps = {
  feastBg?: string;
  dotColor?: string;
  today?: boolean;
  fastColumn?: boolean;
  dayLabel?: string;
};

export function CalendarLegendPreview({
  feastBg,
  dotColor,
  today = false,
  fastColumn = false,
  dayLabel = '7',
}: CalendarLegendPreviewProps) {
  return (
    <View style={[styles.wrap, fastColumn && styles.fastColumn]}>
      <View
        style={[
          styles.dayBox,
          feastBg ? { backgroundColor: feastBg } : null,
          today && styles.todayRing,
        ]}>
        <Text style={[styles.gregorian, today && styles.todayText]}>{dayLabel}</Text>
        <Text style={[styles.ethiopian, today && styles.todayText]}>7</Text>
        <View style={styles.dotSlot}>
          {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    paddingVertical: 2,
  },
  fastColumn: {
    backgroundColor: CALENDAR_VISUAL.fastColumn,
  },
  dayBox: {
    width: 42,
    minHeight: 54,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingBottom: 2,
  },
  todayRing: {
    borderWidth: 1.5,
    borderColor: CALENDAR_VISUAL.todayRing,
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
    height: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
