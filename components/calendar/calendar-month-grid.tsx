import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, type ReactNode } from 'react';
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
  getCalendarVisual,
  getFastIndicatorLevel,
  type FastIndicatorLevel,
} from '@/lib/calendar-visual';
import { getDayInfo } from '@/lib/eotc-liturgical-calendar';
import { BorderRadius, Space, type AppPalette } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const AnimatedView = Animated.createAnimatedComponent(View);

const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 500;
const WEEKDAY_LABEL_LINE_HEIGHT = 13;
/** Fixed day row height — grid grows/shrinks by week count, not cell size. */
const DAY_ROW_HEIGHT = 62;
/** Vertical gap between week rows. */
const DAY_ROW_GAP = Space.s4;

type CalendarColors = ReturnType<typeof getCalendarVisual>;

type DayVisual = {
  feastBg?: string;
  dotColor?: string;
  fastLevel: FastIndicatorLevel | null;
};

type RowBandKind = 'feast';
type BandPosition = 'single' | 'start' | 'middle' | 'end';

function getDayBandKind(
  day: number,
  year: number,
  month: number,
  colors: CalendarColors
): RowBandKind | null {
  const visual = getDayVisual(getDayInfo(new Date(year, month, day)), colors);
  if (visual.feastBg) return 'feast';
  return null;
}

function getRowBandPositions(
  week: (number | null)[],
  year: number,
  month: number,
  colors: CalendarColors
): (BandPosition | null)[] {
  const kinds = week.map((day) =>
    day !== null ? getDayBandKind(day, year, month, colors) : null
  );
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

function getDayVisual(info: ReturnType<typeof getDayInfo>, colors: CalendarColors): DayVisual {
  const majorLord = info.feasts.some(
    (f) => f.isMajor && (f.type === 'lord' || f.type === 'new_year')
  );
  const majorMary = info.feasts.some((f) => f.isMajor && f.type === 'mary');
  const hasMary = info.feasts.some((f) => f.type === 'mary');
  const hasAngel = info.feasts.some((f) => f.type === 'angel');
  const hasFeast = info.feasts.length > 0;
  const fastLevel = getFastIndicatorLevel(info.isFasting, info.fastingReason);

  if (majorLord) {
    return { feastBg: colors.majorLordBg, dotColor: colors.dotGold, fastLevel };
  }
  if (majorMary) {
    return { feastBg: colors.majorMaryBg, dotColor: colors.dotBlue, fastLevel };
  }
  if (hasMary) return { dotColor: colors.dotBlue, fastLevel };
  if (hasAngel) return { dotColor: colors.dotPurple, fastLevel };
  if (hasFeast) return { dotColor: colors.dotGold, fastLevel };

  return { fastLevel };
}

function formatEthDayLabel(info: ReturnType<typeof getDayInfo>): string {
  if (info.ethiopianDate.day === 1) {
    return `${info.ethiopianDate.monthName} ${info.ethiopianDate.day}`;
  }
  return String(info.ethiopianDate.day);
}

function getThemedStyles(palette: AppPalette, colorScheme: 'light' | 'dark', colors: CalendarColors) {
  const light = colorScheme === 'light';
  return StyleSheet.create({
    navSquare: {
      borderColor: palette.border,
      backgroundColor: light ? palette.surface : 'rgba(255,255,255,0.03)',
    },
    yearSkip: { color: palette.text },
    gregorianTitle: { color: palette.text },
    ethiopianTitle: { color: palette.muted },
    card: {
      borderColor: palette.cardBorder,
      backgroundColor: light ? palette.surface : 'rgba(255,255,255,0.02)',
    },
    weekdayLabel: { color: palette.muted },
    daySelected: {
      borderColor: colors.selectedCellBorder,
      backgroundColor: colors.selectedCellBg,
    },
    dayTodayRing: { borderColor: colors.todayCellBorder },
    dayGregorian: { color: palette.text },
    dayEthiopian: { color: palette.muted },
    dayTextSelected: { color: palette.gold, fontWeight: '700' as const },
    dayTextToday: { color: palette.mutedGold, fontWeight: '600' as const },
    dayTextFast: { color: palette.gold },
    dayEthiopianSelected: { color: palette.gold },
    dayEthiopianToday: { color: palette.mutedGold },
    todayButtonText: { color: palette.gold },
  });
}

type ThemedStyles = ReturnType<typeof getThemedStyles>;

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
  themed,
  children,
}: {
  onPress: () => void;
  label: string;
  themed: ThemedStyles;
  children: ReactNode;
}) {
  return (
    <OrthodoxPressable
      onPress={onPress}
      style={[styles.navSquare, themed.navSquare]}
      accessibilityLabel={label}>
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
  colors,
  themed,
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
  colors: CalendarColors;
  themed: ThemedStyles;
  onPress: () => void;
}) {
  const info = getDayInfo(new Date(year, month, day));
  const visual = getDayVisual(info, colors);
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
    bandKind === 'feast' && visual.feastBg === colors.majorLordBg
      ? colors.feastLordBorder
      : bandKind === 'feast'
        ? colors.feastMaryBorder
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
            themed.dayGregorian,
            isSelected && themed.dayTextSelected,
            isToday && !isSelected && themed.dayTextToday,
            isFastingDay && !isSelected && !isToday && themed.dayTextFast,
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
          themed.dayEthiopian,
          info.ethiopianDate.day === 1 && styles.dayEthiopianMonthStart,
          isSelected && themed.dayEthiopianSelected,
          isToday && !isSelected && themed.dayEthiopianToday,
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
          isSelected && themed.daySelected,
          isToday && !isSelected && themed.dayTodayRing,
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
  const { palette, colorScheme } = useThemeTokens();
  const colors = useMemo(
    () => getCalendarVisual(palette, colorScheme),
    [colorScheme, palette]
  );
  const themed = useMemo(
    () => getThemedStyles(palette, colorScheme, colors),
    [colors, colorScheme, palette]
  );
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
            <NavSquare onPress={() => bump(onPrevYear)} label="Previous year" themed={themed}>
              <Text style={[styles.yearSkip, themed.yearSkip]}>«</Text>
            </NavSquare>
            <NavSquare onPress={() => bump(onPrevMonth)} label="Previous month" themed={themed}>
              <Icon name="chevron-left" size={18} color={palette.text} />
            </NavSquare>
          </View>

          <View style={[styles.navCluster, styles.navClusterEnd]}>
            <NavSquare onPress={() => bump(onNextMonth)} label="Next month" themed={themed}>
              <Icon name="chevron-right" size={18} color={palette.text} />
            </NavSquare>
            <NavSquare onPress={() => bump(onNextYear)} label="Next year" themed={themed}>
              <Text style={[styles.yearSkip, themed.yearSkip]}>»</Text>
            </NavSquare>
          </View>
        </View>

        <View style={styles.monthCenter} pointerEvents="none">
          <Text style={[styles.gregorianTitle, themed.gregorianTitle]} numberOfLines={1}>
            {gregorianMonthLabel}
          </Text>
          <Text style={[styles.ethiopianTitle, themed.ethiopianTitle]} numberOfLines={2}>
            {ethiopianMonthLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.card, themed.card]}>
        <GestureDetector gesture={monthSwipe}>
          <Animated.View style={animStyle}>
            <View style={styles.gridArea}>
              <View style={styles.weekdayRow}>
                {weekdays.map((label) => (
                  <View key={label} style={styles.weekdayCell}>
                    <Text style={[styles.weekdayLabel, themed.weekdayLabel]}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.weeksBlock}>
                {weeks.map((week, wi) => {
                  const bandPositions = getRowBandPositions(week, year, month, colors);

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
                            bandKind={getDayBandKind(dayNum, year, month, colors)}
                            bandPosition={bandPositions[col]}
                            monthKey={monthKey}
                            colors={colors}
                            themed={themed}
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
          <Icon name="calendar" size={13} color={palette.gold} />
          <Text style={[styles.todayButtonText, themed.todayButtonText]}>{todayLabel}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSkip: {
    fontSize: 18,
    fontWeight: '600',
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
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  ethiopianTitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
    lineHeight: 17,
  },
  dayEthiopian: {
    fontSize: 9,
    fontWeight: '500',
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
