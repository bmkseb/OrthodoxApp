import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { FastDayUnderline } from '@/components/calendar/fast-day-underline';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/hooks/use-translation';
import { weekdayShortLabels } from '@/lib/calendar-i18n';
import {
  CALENDAR_VISUAL,
  getFastIndicatorLevel,
  type FastIndicatorLevel,
} from '@/lib/calendar-visual';
import { getDayInfo } from '@/lib/eotc-liturgical-calendar';
import { BorderRadius, Palette, Space } from '@/constants/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 500;
const WEEKDAY_LABEL_LINE_HEIGHT = 13;
/** Fixed day row height — grid grows/shrinks by week count, not cell size. */
const DAY_ROW_HEIGHT = 62;
/** Vertical gap between week rows. */
const DAY_ROW_GAP = Space.s4;
const COLORS = CALENDAR_VISUAL;

type DayVisual = {
  feastBg?: string;
  dotColor?: string;
  fastLevel: FastIndicatorLevel | null;
};

type RowBandKind = 'feast';
type BandPosition = 'single' | 'start' | 'middle' | 'end';

function getDayBandKind(day: number, year: number, month: number): RowBandKind | null {
  const visual = getDayVisual(getDayInfo(new Date(year, month, day)));
  if (visual.feastBg) return 'feast';
  return null;
}

function getRowBandPositions(week: (number | null)[], year: number, month: number): (BandPosition | null)[] {
  const kinds = week.map((day) => (day !== null ? getDayBandKind(day, year, month) : null));
  const positions: (BandPosition | null)[] = Array(7).fill(null);

  let col = 0;
  while (col < 7) {
    if (!kinds[col]) {
      col++;
      continue;
    }

    const kind = kinds[col];
    let end = col;
    while (end + 1 < 7 && week[end + 1] !== null && kinds[end + 1] === kind) {
      end++;
    }

    if (col === end) {
      positions[col] = 'single';
    } else {
      for (let i = col; i <= end; i++) {
        if (i === col) positions[i] = 'start';
        else if (i === end) positions[i] = 'end';
        else positions[i] = 'middle';
      }
    }
    col = end + 1;
  }

  return positions;
}

function bandRadius(position: BandPosition) {
  const r = BorderRadius.sm;

  const topLeft = position === 'single' || position === 'start';
  const topRight = position === 'single' || position === 'end';
  const bottomLeft = position === 'single' || position === 'start';
  const bottomRight = position === 'single' || position === 'end';

  return {
    ...(topLeft ? { borderTopLeftRadius: r } : {}),
    ...(topRight ? { borderTopRightRadius: r } : {}),
    ...(bottomLeft ? { borderBottomLeftRadius: r } : {}),
    ...(bottomRight ? { borderBottomRightRadius: r } : {}),
  };
}

function bandOutline(position: BandPosition, color: string) {
  const base = {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: color,
  };
  switch (position) {
    case 'single':
      return { ...base, borderLeftWidth: 1, borderRightWidth: 1 };
    case 'start':
      return { ...base, borderLeftWidth: 1 };
    case 'end':
      return { ...base, borderRightWidth: 1 };
    default:
      return base;
  }
}

function getDayVisual(info: ReturnType<typeof getDayInfo>): DayVisual {
  const majorLord = info.feasts.some(
    (f) => f.isMajor && (f.type === 'lord' || f.type === 'new_year')
  );
  const majorMary = info.feasts.some((f) => f.isMajor && f.type === 'mary');
  const hasMary = info.feasts.some((f) => f.type === 'mary');
  const hasAngel = info.feasts.some((f) => f.type === 'angel');
  const hasFeast = info.feasts.length > 0;
  const fastLevel = getFastIndicatorLevel(info.isFasting, info.fastingReason);

  if (majorLord) {
    return { feastBg: COLORS.majorLordBg, dotColor: COLORS.dotGold, fastLevel };
  }
  if (majorMary) {
    return { feastBg: COLORS.majorMaryBg, dotColor: COLORS.dotBlue, fastLevel };
  }
  if (hasMary) return { dotColor: COLORS.dotBlue, fastLevel };
  if (hasAngel) return { dotColor: COLORS.dotPurple, fastLevel };
  if (hasFeast) return { dotColor: COLORS.dotGold, fastLevel };

  return { fastLevel };
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
  selectedDay?: number | null;
  gregorianMonthLabel: string;
  ethiopianMonthLabel: string;
  todayLabel?: string;
  onGoToToday?: () => void;
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
  isToday,
  isSelected,
  bandKind,
  bandPosition,
  monthKey,
  onPress,
}: {
  day: number;
  year: number;
  month: number;
  isToday: boolean;
  isSelected: boolean;
  bandKind: RowBandKind | null;
  bandPosition: BandPosition | null;
  monthKey: string;
  onPress: () => void;
}) {
  const info = getDayInfo(new Date(year, month, day));
  const visual = getDayVisual(info);
  const isFastingDay = visual.fastLevel != null;
  const selectScale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      selectScale.value = withSequence(
        withSpring(1.06, { damping: 11, stiffness: 420 }),
        withSpring(1, { damping: 14, stiffness: 300 })
      );
    } else {
      selectScale.value = withSpring(1, { damping: 16, stiffness: 320 });
    }
  }, [isSelected, selectScale]);

  const cellAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectScale.value }],
  }));

  const feastBorder =
    bandKind === 'feast' && visual.feastBg === COLORS.majorLordBg
      ? COLORS.feastLordBorder
      : bandKind === 'feast'
        ? COLORS.feastMaryBorder
        : null;

  const bandStyle = [
    styles.dayBand,
    bandKind === 'feast' && visual.feastBg ? { backgroundColor: visual.feastBg } : null,
    bandPosition ? bandRadius(bandPosition) : null,
    bandPosition && bandKind === 'feast' && feastBorder
      ? bandOutline(bandPosition, feastBorder)
      : null,
  ];

  const content = (
    <View style={styles.dayBox}>
      <View style={styles.dateStack}>
        <Text
          style={[
            styles.dayGregorian,
            isSelected && styles.dayTextSelected,
            isToday && !isSelected && styles.dayTextToday,
            isFastingDay && !isSelected && !isToday && styles.dayTextFast,
          ]}>
          {day}
        </Text>
        {isFastingDay && visual.fastLevel ? (
          <FastDayUnderline
            key={monthKey}
            level={visual.fastLevel}
            selected={isSelected}
          />
        ) : null}
      </View>
      <Text
        style={[
          styles.dayEthiopian,
          info.ethiopianDate.day === 1 && styles.dayEthiopianMonthStart,
          isSelected && styles.dayEthiopianSelected,
          isToday && !isSelected && styles.dayEthiopianToday,
        ]}
        numberOfLines={info.ethiopianDate.day === 1 ? 2 : 1}>
        {formatEthDayLabel(info)}
      </Text>
      {visual.dotColor ? (
        <View style={styles.dotSlot}>
          <View style={[styles.dot, { backgroundColor: visual.dotColor }]} />
        </View>
      ) : null}
    </View>
  );

  return (
    <AnimatedView style={[styles.dayCellWrap, cellAnimStyle]}>
      <OrthodoxPressable
        style={[
          styles.dayCell,
          isSelected && styles.daySelected,
          isToday && !isSelected && styles.dayTodayRing,
        ]}
        onPress={onPress}
        haptic={false}>
        {bandKind ? <View style={bandStyle}>{content}</View> : content}
      </OrthodoxPressable>
    </AnimatedView>
  );
}

export function CalendarMonthGrid({
  year,
  month,
  today,
  selectedDay = null,
  gregorianMonthLabel,
  ethiopianMonthLabel,
  todayLabel = 'Today',
  onGoToToday,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onPrevYear,
  onNextYear,
}: CalendarMonthGridProps) {
  const { mode } = useTranslation();
  const weekdays = weekdayShortLabels(mode);
  const slideX = useSharedValue(0);
  const dragX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const monthKey = `${year}-${month}`;

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
        <View style={styles.monthHeaderControls}>
          <View style={[styles.navCluster, styles.navClusterStart]}>
            <NavSquare onPress={() => bump(onPrevYear)} label="Previous year">
              <Text style={styles.yearSkip}>«</Text>
            </NavSquare>
            <NavSquare onPress={() => bump(onPrevMonth)} label="Previous month">
              <Icon name="chevron-left" size={18} color={Palette.text} />
            </NavSquare>
          </View>

          <View style={[styles.navCluster, styles.navClusterEnd]}>
            <NavSquare onPress={() => bump(onNextMonth)} label="Next month">
              <Icon name="chevron-right" size={18} color={Palette.text} />
            </NavSquare>
            <NavSquare onPress={() => bump(onNextYear)} label="Next year">
              <Text style={styles.yearSkip}>»</Text>
            </NavSquare>
          </View>
        </View>

        <View style={styles.monthCenter} pointerEvents="none">
          <Text style={styles.gregorianTitle} numberOfLines={1}>
            {gregorianMonthLabel}
          </Text>
          <Text style={styles.ethiopianTitle} numberOfLines={2}>
            {ethiopianMonthLabel}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <GestureDetector gesture={monthSwipe}>
          <Animated.View style={animStyle}>
            <View style={styles.gridArea}>
              <View style={styles.weekdayRow}>
                {weekdays.map((label) => (
                  <View key={label} style={styles.weekdayCell}>
                    <Text style={styles.weekdayLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.weeksBlock}>
                {weeks.map((week, wi) => {
                  const bandPositions = getRowBandPositions(week, year, month);

                  return (
                    <View key={`w-${wi}`} style={styles.weekRow}>
                      {week.map((dayNum, col) =>
                        dayNum !== null ? (
                          <DayCell
                            key={`d-${dayNum}`}
                            day={dayNum}
                            year={year}
                            month={month}
                            isToday={isCurrentMonth && dayNum === today.day}
                            isSelected={selectedDay === dayNum}
                            bandKind={getDayBandKind(dayNum, year, month)}
                            bandPosition={bandPositions[col]}
                            monthKey={monthKey}
                            onPress={() => onSelectDay(dayNum)}
                          />
                        ) : (
                          <View key={`e-${wi}-${col}`} style={styles.dayCellWrap}>
                            <View style={styles.dayCell} />
                          </View>
                        )
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      {onGoToToday && !isCurrentMonth ? (
        <OrthodoxPressable
          style={styles.todayButton}
          onPress={() => bump(onGoToToday)}
          accessibilityRole="button"
          accessibilityLabel={todayLabel}>
          <Icon name="calendar" size={13} color={Palette.gold} />
          <Text style={styles.todayButtonText}>{todayLabel}</Text>
        </OrthodoxPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s8,
  },
  monthHeader: {
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: Space.s8,
  },
  monthHeaderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
    paddingHorizontal: Space.s12,
    paddingVertical: 6,
    marginTop: Space.s12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.gold,
    letterSpacing: 0.2,
  },
  navCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s4,
    width: 72,
  },
  navClusterStart: {
    justifyContent: 'flex-start',
  },
  navClusterEnd: {
    justifyContent: 'flex-end',
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
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 80,
  },
  gregorianTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  ethiopianTitle: {
    fontSize: 12,
    color: Palette.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingTop: Space.s8,
    paddingBottom: Space.s4,
    paddingHorizontal: Space.s4,
  },
  gridArea: {
    position: 'relative',
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
    lineHeight: WEEKDAY_LABEL_LINE_HEIGHT,
    color: Palette.muted,
  },
  weeksBlock: {
    gap: DAY_ROW_GAP,
  },
  weekRow: {
    flexDirection: 'row',
    height: DAY_ROW_HEIGHT,
  },
  dayCellWrap: {
    flex: 1,
    height: DAY_ROW_HEIGHT,
    overflow: 'visible',
  },
  dayBand: {
    width: '100%',
    height: DAY_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dayCell: {
    flex: 1,
    width: '100%',
    height: DAY_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  daySelected: {
    borderColor: CALENDAR_VISUAL.selectedCellBorder,
    backgroundColor: CALENDAR_VISUAL.selectedCellBg,
  },
  dayTodayRing: {
    borderColor: CALENDAR_VISUAL.todayCellBorder,
  },
  dayBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 7,
    paddingBottom: 4,
    paddingHorizontal: 2,
  },
  dateStack: {
    alignItems: 'center',
    minHeight: 23,
  },
  dayGregorian: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 17,
  },
  dayEthiopian: {
    fontSize: 9,
    fontWeight: '500',
    color: Palette.muted,
    lineHeight: 11,
    marginTop: 3,
    maxWidth: 48,
    textAlign: 'center',
  },
  dayEthiopianMonthStart: {
    fontSize: 8,
    lineHeight: 10,
    maxWidth: 52,
  },
  dayTextSelected: {
    color: Palette.gold,
    fontWeight: '700',
  },
  dayTextToday: {
    color: Palette.mutedGold,
    fontWeight: '600',
  },
  dayTextFast: {
    color: Palette.gold,
  },
  dayEthiopianSelected: {
    color: Palette.gold,
  },
  dayEthiopianToday: {
    color: Palette.mutedGold,
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
