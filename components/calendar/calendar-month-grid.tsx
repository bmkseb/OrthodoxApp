import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { OrthodoxPressable } from '@/components/ui/orthodox-pressable';
import { Animation, Palette } from '@/constants/theme';
import {
  CalendarFilterId,
  DayInfo,
  getDayInfo,
  matchesFilter,
} from '@/data/orthodoxCalendar';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type CalendarMonthGridProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  activeFilter: CalendarFilterId;
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type DayCellProps = {
  date: Date;
  dayInfo: DayInfo;
  isToday: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isCurrentMonth: boolean;
  onPress: (date: Date) => void;
};

function DayCell({
  date,
  dayInfo,
  isToday,
  isSelected,
  isDimmed,
  isCurrentMonth,
  onPress,
}: DayCellProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (dayInfo.isMajorFeast && isCurrentMonth) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        false
      );
    }
  }, [dayInfo.isMajorFeast, isCurrentMonth, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dayInfo.isMajorFeast && isCurrentMonth ? pulse.value : 1 }],
  }));

  const showCross = dayInfo.isFeast || dayInfo.isMajorFeast;
  const fastingTint = dayInfo.isFasting && !dayInfo.isMajorFeast;

  return (
    <OrthodoxPressable
      style={[styles.dayCell, isDimmed && styles.dayCellDimmed]}
      onPress={() => onPress(date)}
      accessibilityRole="button"
      accessibilityLabel={`${date.getDate()}`}>
      <Animated.View style={[styles.dayInner, pulseStyle]}>
        {dayInfo.isMajorFeast && (
          <LinearGradient
            colors={['#D4A84B', '#C9933A', '#A67A2E']}
            style={styles.majorCircle}
          />
        )}
        {isSelected && !dayInfo.isMajorFeast && <View style={styles.selectedCircle} />}
        {isToday && !isSelected && !dayInfo.isMajorFeast && <View style={styles.todayRing} />}
        {showCross && (
          <Text style={[styles.cross, isDimmed && styles.crossDimmed]}>☩</Text>
        )}
        <Text
          style={[
            styles.dayNumber,
            !isCurrentMonth && styles.dayNumberOutside,
            fastingTint && styles.dayNumberFasting,
            isSelected && styles.dayNumberSelected,
            dayInfo.isMajorFeast && styles.dayNumberMajor,
            isDimmed && styles.dayNumberDimmed,
          ]}>
          {date.getDate()}
        </Text>
      </Animated.View>
    </OrthodoxPressable>
  );
}

function CalendarMonthGridComponent({
  selectedDate,
  onSelectDate,
  activeFilter,
}: CalendarMonthGridProps) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [slideKey, setSlideKey] = useState(0);

  const cells = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const changeMonth = useCallback(
    (delta: number) => {
      Haptics.selectionAsync();
      let nextMonth = viewMonth + delta;
      let nextYear = viewYear;
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear -= 1;
      } else if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
      setViewMonth(nextMonth);
      setViewYear(nextYear);
      setSlideKey((k) => k + 1);
    },
    [viewMonth, viewYear]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.chevronBtn}
          accessibilityLabel="Previous month">
          <Text style={styles.chevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.chevronBtn}
          accessibilityLabel="Next month">
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <Animated.View
        key={slideKey}
        entering={FadeIn.duration(Animation.tabFadeMs)}
        exiting={FadeOut.duration(Animation.tabFadeMs)}
        style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          const dayInfo = getDayInfo(date);
          const dimmed = activeFilter !== 'all' && !matchesFilter(dayInfo, activeFilter);
          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              dayInfo={dayInfo}
              isToday={isSameDay(date, today)}
              isSelected={isSameDay(date, selectedDate)}
              isDimmed={dimmed}
              isCurrentMonth={date.getMonth() === viewMonth}
              onPress={onSelectDate}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

export const CalendarMonthGrid = memo(CalendarMonthGridComponent);

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chevronBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: Palette.gold,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  monthLabel: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: Palette.gold,
    opacity: 0.6,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: CELL_SIZE + 8,
  },
  dayCellDimmed: {
    opacity: 0.35,
  },
  dayInner: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  majorCircle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CELL_SIZE / 2,
  },
  selectedCircle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CELL_SIZE / 2,
    backgroundColor: Palette.gold,
  },
  todayRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CELL_SIZE / 2,
    borderWidth: 2,
    borderColor: Palette.gold,
  },
  cross: {
    position: 'absolute',
    top: 2,
    fontSize: 8,
    color: Palette.gold,
    lineHeight: 10,
  },
  crossDimmed: {
    opacity: 0.5,
  },
  dayNumber: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '500',
    zIndex: 1,
  },
  dayNumberOutside: {
    opacity: 0.3,
  },
  dayNumberFasting: {
    color: 'rgba(201, 147, 58, 0.7)',
  },
  dayNumberSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  dayNumberMajor: {
    color: '#000000',
    fontWeight: '700',
  },
  dayNumberDimmed: {
    opacity: 0.5,
  },
});
