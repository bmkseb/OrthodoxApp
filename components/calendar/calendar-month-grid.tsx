import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Icon } from '@/components/Icon';
import { CALENDAR_VISUAL } from '@/lib/calendar-visual';
import { getDayInfo } from '@/lib/eotc-liturgical-calendar';
import { BorderRadius, Palette, Space } from '@/constants/theme';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 500;
const FAST_COLUMNS = new Set([3, 5]);

const COLORS = CALENDAR_VISUAL;

type DayVisual = {
  feastBg?: string;
  dotColor?: string;
};

function getDayVisual(info: ReturnType<typeof getDayInfo>): DayVisual {
  const majorLord = info.feasts.some(
    (f) => f.isMajor && (f.type === 'lord' || f.type === 'new_year')
  );
  const majorMary = info.feasts.some((f) => f.isMajor && f.type === 'mary');
  const hasMary = info.feasts.some((f) => f.type === 'mary');
  const hasAngel = info.feasts.some((f) => f.type === 'angel');
  const hasFeast = info.feasts.length > 0;

  if (majorLord) return { feastBg: COLORS.majorLordBg, dotColor: COLORS.dotGold };
  if (majorMary) return { feastBg: COLORS.majorMaryBg, dotColor: COLORS.dotBlue };
  if (hasMary) return { feastBg: COLORS.majorMaryBg, dotColor: COLORS.dotBlue };
  if (hasAngel) return { dotColor: COLORS.dotPurple };
  if (hasFeast && info.isFasting) return { dotColor: COLORS.dotGrey };
  if (info.isFasting) return { dotColor: COLORS.dotGrey };
  if (hasFeast) return { dotColor: COLORS.dotGold };

  return {};
}

function formatEthDayLabel(info: ReturnType<typeof getDayInfo>): string {
  if (info.ethiopianDate.day === 1) {
    return `${info.ethiopianDate.monthName} ${info.ethiopianDate.day}`;
  }
  return String(info.ethiopianDate.day);
}

type CalendarMonthGridProps = {
  year: number;
  month: number;
  today: { year: number; month: number; day: number };
  gregorianMonthLabel: string;
  ethiopianMonthLabel: string;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
};

function NavSquare({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <OrthodoxPressable onPress={onPress} style={styles.navSquare} accessibilityLabel={label}>
      {children}
    </OrthodoxPressable>
  );
}

function DayCell({
  day,
  year,
  month,
  column,
  isToday,
  onPress,
}: {
  day: number;
  year: number;
  month: number;
  column: number;
  isToday: boolean;
  onPress: () => void;
}) {
  const info = getDayInfo(new Date(year, month, day));
  const visual = getDayVisual(info);
  const isFastColumn = FAST_COLUMNS.has(column);

  return (
    <OrthodoxPressable
      style={[styles.dayCell, isFastColumn && styles.fastColumnCell]}
      onPress={onPress}
      haptic={false}>
      <View
        style={[
          styles.dayBox,
          visual.feastBg ? { backgroundColor: visual.feastBg } : null,
          isToday && styles.dayTodayRing,
        ]}>
        <Text style={[styles.dayGregorian, isToday && styles.dayTextToday]}>{day}</Text>
        <Text
          style={[styles.dayEthiopian, isToday && styles.dayEthiopianToday]}
          numberOfLines={1}>
          {formatEthDayLabel(info)}
        </Text>
        <View style={styles.dotSlot}>
          {visual.dotColor ? <View style={[styles.dot, { backgroundColor: visual.dotColor }]} /> : null}
        </View>
      </View>
    </OrthodoxPressable>
  );
}

export function CalendarMonthGrid({
  year,
  month,
  today,
  gregorianMonthLabel,
  ethiopianMonthLabel,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
}: CalendarMonthGridProps) {
  const slideX = useSharedValue(0);
  const dragX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    slideX.value = 10;
    opacity.value = 0;
    slideX.value = withTiming(0, { duration: 220 });
    opacity.value = withTiming(1, { duration: 220 });
  }, [year, month, slideX, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: slideX.value + dragX.value }],
  }));

  const bump = (fn: () => void) => {
    Haptics.selectionAsync();
    fn();
  };

  const monthSwipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-18, 18])
    .onUpdate((event) => {
      dragX.value = event.translationX * 0.4;
    })
    .onEnd((event) => {
      const goNext = event.translationX < -SWIPE_DISTANCE || event.velocityX < -SWIPE_VELOCITY;
      const goPrev = event.translationX > SWIPE_DISTANCE || event.velocityX > SWIPE_VELOCITY;
      if (goNext) runOnJS(bump)(onNextMonth);
      else if (goPrev) runOnJS(bump)(onPrevMonth);
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

  const isCurrentMonth = today.year === year && today.month === month;

  return (
    <View style={styles.wrap}>
      <View style={styles.monthHeader}>
        <View style={styles.navCluster}>
          <NavSquare onPress={() => bump(onPrevYear)} label="Previous year">
            <Text style={styles.yearSkip}>«</Text>
          </NavSquare>
          <NavSquare onPress={() => bump(onPrevMonth)} label="Previous month">
            <Icon name="chevron-left" size={18} color={Palette.text} />
          </NavSquare>
        </View>

        <View style={styles.monthCenter}>
          <Text style={styles.gregorianTitle}>{gregorianMonthLabel}</Text>
          <Text style={styles.ethiopianTitle}>{ethiopianMonthLabel}</Text>
        </View>

        <View style={styles.navCluster}>
          <NavSquare onPress={() => bump(onNextMonth)} label="Next month">
            <Icon name="chevron-right" size={18} color={Palette.text} />
          </NavSquare>
          <NavSquare onPress={() => bump(onNextYear)} label="Next year">
            <Text style={styles.yearSkip}>»</Text>
          </NavSquare>
        </View>
      </View>

      <View style={styles.card}>
        <GestureDetector gesture={monthSwipe}>
          <Animated.View style={animStyle}>
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((label, col) => (
                <View
                  key={label}
                  style={[styles.weekdayCell, FAST_COLUMNS.has(col) && styles.fastColumnCell]}>
                  <Text style={styles.weekdayLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={`w-${wi}`} style={styles.weekRow}>
                {week.map((dayNum, col) =>
                  dayNum !== null ? (
                    <DayCell
                      key={`d-${dayNum}`}
                      day={dayNum}
                      year={year}
                      month={month}
                      column={col}
                      isToday={isCurrentMonth && dayNum === today.day}
                      onPress={() => onSelectDay(dayNum)}
                    />
                  ) : (
                    <View
                      key={`e-${wi}-${col}`}
                      style={[styles.dayCell, FAST_COLUMNS.has(col) && styles.fastColumnCell]}
                    />
                  )
                )}
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.s12,
  },
  navCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
  },
  navSquare: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  yearSkip: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 20,
  },
  monthCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Space.s8,
  },
  gregorianTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  ethiopianTitle: {
    fontSize: 12,
    color: Palette.muted,
    marginTop: 2,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingTop: Space.s8,
    paddingBottom: Space.s8,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Space.s4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Space.s4,
  },
  weekdayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.muted,
  },
  weekRow: {
    flexDirection: 'row',
  },
  fastColumnCell: {
    backgroundColor: COLORS.fastColumn,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    minHeight: 58,
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
  dayTodayRing: {
    borderWidth: 1.5,
    borderColor: Palette.gold,
  },
  dayGregorian: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 18,
  },
  dayEthiopian: {
    fontSize: 9,
    fontWeight: '500',
    color: Palette.muted,
    lineHeight: 11,
    marginTop: 2,
    maxWidth: 40,
    textAlign: 'center',
  },
  dayTextToday: {
    color: Palette.gold,
  },
  dayEthiopianToday: {
    color: Palette.gold,
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
