import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Icon } from '@/components/Icon';
import {
  CalendarFilter,
  getDayInfo,
  matchesFilter,
} from '@/data/orthodoxCalendar';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type CalendarMonthGridProps = {
  year: number;
  month: number;
  selectedDay: number | null;
  today: { year: number; month: number; day: number };
  filter: CalendarFilter;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthLabel: string;
};

function DayCell({
  day,
  year,
  month,
  isToday,
  isSelected,
  filter,
  onPress,
  pulseMajor,
}: {
  day: number;
  year: number;
  month: number;
  isToday: boolean;
  isSelected: boolean;
  filter: CalendarFilter;
  onPress: () => void;
  pulseMajor: boolean;
}) {
  const info = getDayInfo(year, month, day);
  const dimmed = !matchesFilter(filter, info);
  const isMajor = !!info.majorFeast;
  const showCross = isMajor || info.hasFeast || info.hasMarian;

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (pulseMajor && isMajor) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulse.value = 1;
    }
  }, [pulseMajor, isMajor, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <OrthodoxPressable style={styles.dayCell} onPress={onPress} haptic={false}>
      <Animated.View style={[styles.dayInner, dimmed && styles.dayDimmed, pulseStyle]}>
        {showCross ? <Text style={styles.feastCross}>☩</Text> : <View style={styles.crossSpacer} />}
        <View
          style={[
            styles.dayCircle,
            isToday && !isSelected && styles.dayTodayRing,
            isSelected && styles.daySelected,
            isMajor && !isSelected && styles.dayMajor,
          ]}>
          {isMajor && !isSelected ? (
            <LinearGradient
              colors={['#E8C06A', '#C9933A', '#8B6914']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ) : null}
          <Text
            style={[
              styles.dayText,
              info.fasting && !isSelected && styles.dayFasting,
              isSelected && styles.dayTextSelected,
              isMajor && !isSelected && styles.dayTextMajor,
            ]}>
            {day}
          </Text>
        </View>
      </Animated.View>
    </OrthodoxPressable>
  );
}

export function CalendarMonthGrid({
  year,
  month,
  selectedDay,
  today,
  filter,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  monthLabel,
}: CalendarMonthGridProps) {
  const slideX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    slideX.value = 12;
    opacity.value = 0;
    slideX.value = withTiming(0, { duration: 280 });
    opacity.value = withTiming(1, { duration: 280 });
  }, [year, month, slideX, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slideX.value }],
  }));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const weeks: (number | null)[][] = [];
  let d = 1;

  for (let row = 0; row < totalCells / 7; row++) {
    const week: (number | null)[] = [];
    for (let col = 0; col < 7; col++) {
      const idx = row * 7 + col;
      if (idx < firstWeekday || d > daysInMonth) week.push(null);
      else {
        week.push(d);
        d++;
      }
    }
    weeks.push(week);
  }

  const handlePrev = () => {
    Haptics.selectionAsync();
    onPrevMonth();
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    onNextMonth();
  };

  const isCurrentMonth = today.year === year && today.month === month;

  return (
    <View style={styles.wrap}>
      <View style={styles.monthHeader}>
        <OrthodoxPressable onPress={handlePrev} style={styles.chevronBtn}>
          <Icon name="chevron-left" size={22} />
        </OrthodoxPressable>
        <Text style={styles.monthTitle}>{monthLabel}</Text>
        <OrthodoxPressable onPress={handleNext} style={styles.chevronBtn}>
          <Icon name="chevron-right" size={22} />
        </OrthodoxPressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((label) => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <Animated.View style={animStyle}>
        {weeks.map((week, wi) => (
          <View key={`w-${wi}`} style={styles.weekRow}>
            {week.map((dayNum, di) =>
              dayNum !== null ? (
                <DayCell
                  key={`d-${dayNum}`}
                  day={dayNum}
                  year={year}
                  month={month}
                  isToday={isCurrentMonth && dayNum === today.day}
                  isSelected={selectedDay === dayNum}
                  filter={filter}
                  onPress={() => onSelectDay(dayNum)}
                  pulseMajor={isCurrentMonth}
                />
              ) : (
                <View key={`e-${wi}-${di}`} style={styles.dayCell} />
              )
            )}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Layout.sectionGap,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.headerContentGap,
  },
  chevronBtn: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: 'rgba(201, 147, 58, 0.6)',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 52,
  },
  dayInner: {
    alignItems: 'center',
  },
  dayDimmed: {
    opacity: 0.25,
  },
  feastCross: {
    fontSize: 8,
    color: Palette.gold,
    lineHeight: 10,
    marginBottom: 2,
  },
  crossSpacer: {
    height: 10,
    marginBottom: 2,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayTodayRing: {
    borderWidth: 2,
    borderColor: Palette.gold,
    backgroundColor: 'transparent',
  },
  daySelected: {
    backgroundColor: Palette.gold,
  },
  dayMajor: {
    borderWidth: 0,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.text,
  },
  dayFasting: {
    color: Palette.mutedGold,
  },
  dayTextSelected: {
    color: Palette.background,
    fontWeight: '700',
  },
  dayTextMajor: {
    color: Palette.background,
    fontWeight: '700',
  },
});
