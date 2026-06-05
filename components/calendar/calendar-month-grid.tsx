import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Icon } from '@/components/Icon';
import { getDayInfo } from '@/data/orthodoxCalendar';
import { BorderRadius, Layout, Opacity, Palette, Space } from '@/constants/theme';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 500;

type CalendarMonthGridProps = {
  year: number;
  month: number;
  today: { year: number; month: number; day: number };
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onGoToToday: () => void;
  isViewingToday: boolean;
  todayLabel: string;
  monthLabel: string;
};

function DayCell({
  day,
  year,
  month,
  isToday,
  onPress,
  pulseMajor,
}: {
  day: number;
  year: number;
  month: number;
  isToday: boolean;
  onPress: () => void;
  pulseMajor: boolean;
}) {
  const info = getDayInfo(year, month, day);
  const isMajor = !!info.majorFeast;
  const isFeast = info.hasFeast || info.hasMarian;
  const showCross = isMajor;
  const showFeastRing = isFeast || isMajor;

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
      <Animated.View style={[styles.dayInner, pulseStyle]}>
        {showCross ? <Text style={styles.feastCross}>☩</Text> : <View style={styles.crossSpacer} />}
        <View
          style={[
            styles.dayCircle,
            showFeastRing && !isToday && styles.dayFeastRing,
            isToday && styles.dayTodayFill,
          ]}>
          <Text
            style={[
              styles.dayText,
              info.fasting && !isToday && styles.dayFasting,
              isToday && styles.dayTextToday,
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
  today,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
  onGoToToday,
  isViewingToday,
  todayLabel,
  monthLabel,
}: CalendarMonthGridProps) {
  const slideX = useSharedValue(0);
  const dragX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    slideX.value = 12;
    opacity.value = 0;
    slideX.value = withTiming(0, { duration: 280 });
    opacity.value = withTiming(1, { duration: 280 });
  }, [year, month, slideX, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slideX.value + dragX.value }],
  }));

  const handlePrev = () => {
    Haptics.selectionAsync();
    onPrevMonth();
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    onNextMonth();
  };

  const monthSwipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-18, 18])
    .onUpdate((event) => {
      dragX.value = event.translationX * 0.45;
    })
    .onEnd((event) => {
      const goNext =
        event.translationX < -SWIPE_DISTANCE || event.velocityX < -SWIPE_VELOCITY;
      const goPrev =
        event.translationX > SWIPE_DISTANCE || event.velocityX > SWIPE_VELOCITY;

      if (goNext) {
        runOnJS(handleNext)();
      } else if (goPrev) {
        runOnJS(handlePrev)();
      }

      dragX.value = withSpring(0, { damping: 22, stiffness: 320 });
    })
    .onFinalize(() => {
      dragX.value = withSpring(0, { damping: 22, stiffness: 320 });
    });

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

  const handlePrevYear = () => {
    Haptics.selectionAsync();
    onPrevYear();
  };

  const handleNextYear = () => {
    Haptics.selectionAsync();
    onNextYear();
  };

  const handleGoToToday = () => {
    if (isViewingToday) return;
    Haptics.selectionAsync();
    onGoToToday();
  };

  const isCurrentMonth = today.year === year && today.month === month;

  return (
    <View style={styles.wrap}>
      <View style={styles.monthHeader}>
        <View style={styles.navGroup}>
          <OrthodoxPressable
            onPress={handlePrevYear}
            style={styles.navBtn}
            accessibilityLabel="Previous year">
            <Text style={styles.yearSkip}>«</Text>
          </OrthodoxPressable>
          <OrthodoxPressable
            onPress={handlePrev}
            style={styles.navBtn}
            accessibilityLabel="Previous month">
            <Icon name="chevron-left" size={22} color={Palette.gold} />
          </OrthodoxPressable>
        </View>

        <Text style={styles.monthTitle}>{monthLabel}</Text>

        <View style={styles.navGroup}>
          <OrthodoxPressable
            onPress={handleNext}
            style={styles.navBtn}
            accessibilityLabel="Next month">
            <Icon name="chevron-right" size={22} color={Palette.gold} />
          </OrthodoxPressable>
          <OrthodoxPressable
            onPress={handleNextYear}
            style={styles.navBtn}
            accessibilityLabel="Next year">
            <Text style={styles.yearSkip}>»</Text>
          </OrthodoxPressable>
        </View>
      </View>

      <OrthodoxPressable
        onPress={handleGoToToday}
        style={[styles.todayBtn, isViewingToday && styles.todayBtnActive]}
        accessibilityLabel={todayLabel}
        accessibilityState={{ disabled: isViewingToday }}>
        <Icon name="calendar" size={11} color={isViewingToday ? Palette.background : Palette.gold} />
        <Text style={[styles.todayBtnText, isViewingToday && styles.todayBtnTextActive]}>
          {todayLabel}
        </Text>
      </OrthodoxPressable>

      <GestureDetector gesture={monthSwipe}>
        <Animated.View style={styles.swipeArea}>
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
        </Animated.View>
      </GestureDetector>
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
    marginBottom: Space.s8,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSkip: {
    fontSize: 22,
    fontWeight: '600',
    color: Palette.gold,
    lineHeight: 24,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 5,
    paddingHorizontal: Space.s12,
    paddingVertical: 5,
    marginBottom: Space.s8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
  todayBtnActive: {
    backgroundColor: Palette.gold,
    borderColor: Palette.gold,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.gold,
    letterSpacing: 0.2,
  },
  todayBtnTextActive: {
    color: Palette.background,
  },
  swipeArea: {
    flexGrow: 0,
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
    color: '#FFFFFF',
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
  dayFeastRing: {
    borderWidth: 2,
    borderColor: Palette.gold,
    backgroundColor: 'transparent',
  },
  dayTodayFill: {
    backgroundColor: Palette.gold,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dayFasting: {
    color: Palette.gold,
  },
  dayTextToday: {
    color: Palette.background,
    fontWeight: '700',
  },
});
