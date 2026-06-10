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
import { useTranslation } from '@/hooks/use-translation';
import { weekdayShortLabels } from '@/lib/calendar-i18n';
import { CALENDAR_VISUAL } from '@/lib/calendar-visual';
import { getDayInfo } from '@/lib/eotc-liturgical-calendar';
import { BorderRadius, Palette, Space } from '@/constants/theme';
const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 500;
const FAST_COLUMNS = [3, 5] as const;
const WEEKDAY_LABEL_LINE_HEIGHT = 13;
/** Weekday label row through its bottom margin — aligns day stripes with row 1. */
const FAST_WEEKDAY_BAND_HEIGHT = Space.s4 * 2 + WEEKDAY_LABEL_LINE_HEIGHT + Space.s4;
/** Fixed day row height — grid grows/shrinks by week count, not cell size. */
const DAY_ROW_HEIGHT = 62;
/** Vertical gap between week rows; grey stripes skip this space. */
const DAY_ROW_GAP = Space.s4;
const COLORS = CALENDAR_VISUAL;

const SEASONAL_FAST_REASONS = new Set([
  'Lent',
  'Fast of Nineveh',
  'Fast of Apostles',
  'Fast of Mary',
  'Advent',
]);

type DayVisual = {
  feastBg?: string;
  dotColor?: string;
  seasonalFast?: boolean;
};

type RowBandKind = 'fast' | 'feast';
type BandPosition = 'single' | 'start' | 'middle' | 'end';

function getDayBandKind(day: number, year: number, month: number): RowBandKind | null {
  const visual = getDayVisual(getDayInfo(new Date(year, month, day)));
  if (visual.feastBg) return 'feast';
  if (visual.seasonalFast) return 'fast';
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

function isFastWeekdayColumn(col: number): boolean {
  return (FAST_COLUMNS as readonly number[]).includes(col);
}

function getFirstSeasonalFastRowForColumn(
  weeks: (number | null)[][],
  year: number,
  month: number,
  col: number
): number | null {
  for (let wi = 0; wi < weeks.length; wi++) {
    const dayNum = weeks[wi][col];
    if (dayNum !== null && getDayBandKind(dayNum, year, month) === 'fast') {
      return wi;
    }
  }
  return null;
}

function getLastSeasonalFastRowForColumn(
  weeks: (number | null)[][],
  year: number,
  month: number,
  col: number
): number | null {
  let lastRow: number | null = null;

  weeks.forEach((week, wi) => {
    const dayNum = week[col];
    if (dayNum !== null && getDayBandKind(dayNum, year, month) === 'fast') {
      lastRow = wi;
    }
  });

  return lastRow;
}

function bandRadius(
  position: BandPosition,
  options?: { flatTop?: boolean; flatBottom?: boolean }
) {
  const r = BorderRadius.sm;
  const { flatTop = false, flatBottom = false } = options ?? {};

  const topLeft = !flatTop && (position === 'single' || position === 'start');
  const topRight = !flatTop && (position === 'single' || position === 'end');
  const bottomLeft = !flatBottom && (position === 'single' || position === 'start');
  const bottomRight = !flatBottom && (position === 'single' || position === 'end');

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

function isSeasonalFastDay(info: ReturnType<typeof getDayInfo>): boolean {
  return info.fastingReason != null && SEASONAL_FAST_REASONS.has(info.fastingReason);
}

function getDayVisual(info: ReturnType<typeof getDayInfo>): DayVisual {
  const majorLord = info.feasts.some(
    (f) => f.isMajor && (f.type === 'lord' || f.type === 'new_year')
  );
  const majorMary = info.feasts.some((f) => f.isMajor && f.type === 'mary');
  const hasMary = info.feasts.some((f) => f.type === 'mary');
  const hasAngel = info.feasts.some((f) => f.type === 'angel');
  const hasFeast = info.feasts.length > 0;
  const seasonalFast = isSeasonalFastDay(info);

  if (majorLord) {
    return { feastBg: COLORS.majorLordBg, dotColor: COLORS.dotGold, seasonalFast };
  }
  if (majorMary) {
    return { feastBg: COLORS.majorMaryBg, dotColor: COLORS.dotBlue, seasonalFast };
  }
  if (hasMary) return { dotColor: COLORS.dotBlue, seasonalFast };
  if (hasAngel) return { dotColor: COLORS.dotPurple, seasonalFast };
  if (hasFeast) return { dotColor: COLORS.dotGold, seasonalFast };

  return { seasonalFast };
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
  column,
  bandKind,
  bandPosition,
  isFirstFastRowInColumn,
  isLastFastRowInColumn,
  onPress,
}: {
  day: number;
  year: number;
  month: number;
  isToday: boolean;
  column: number;
  bandKind: RowBandKind | null;
  bandPosition: BandPosition | null;
  isFirstFastRowInColumn: boolean;
  isLastFastRowInColumn: boolean;
  onPress: () => void;
}) {
  const info = getDayInfo(new Date(year, month, day));
  const visual = getDayVisual(info);
  const feastBorder =
    bandKind === 'feast' && visual.feastBg === COLORS.majorLordBg
      ? COLORS.feastLordBorder
      : bandKind === 'feast'
        ? COLORS.feastMaryBorder
        : null;

  const bandStyle = [
    styles.dayBand,
    bandKind === 'fast' && styles.fastSeasonBand,
    bandKind === 'feast' && visual.feastBg ? { backgroundColor: visual.feastBg } : null,
    bandPosition
      ? bandRadius(bandPosition, {
          flatTop: bandKind === 'fast' && isFirstFastRowInColumn && isFastWeekdayColumn(column),
          flatBottom: bandKind === 'fast' && isLastFastRowInColumn && isFastWeekdayColumn(column),
        })
      : null,
    bandPosition && bandKind === 'feast' && feastBorder
      ? bandOutline(bandPosition, feastBorder)
      : null,
  ];

  const content = (
    <View style={styles.dayBox}>
      <Text style={[styles.dayGregorian, isToday && styles.dayTextToday]}>{day}</Text>
      <Text
        style={[styles.dayEthiopian, isToday && styles.dayEthiopianToday]}
        numberOfLines={1}>
        {formatEthDayLabel(info)}
      </Text>
      {visual.dotColor || visual.seasonalFast ? (
        <View style={styles.dotSlot}>
          {visual.dotColor ? (
            <View style={[styles.dot, { backgroundColor: visual.dotColor }]} />
          ) : (
            <View style={styles.fastMarker} />
          )}
        </View>
      ) : null}
    </View>
  );

  return (
    <OrthodoxPressable
      style={[styles.dayCell, isToday && styles.dayTodayRing]}
      onPress={onPress}
      haptic={false}>
      {bandKind ? <View style={bandStyle}>{content}</View> : content}
    </OrthodoxPressable>
  );
}

function FastColumnStripes() {
  return (
    <View style={styles.fastColumnLayer} pointerEvents="none">
      {FAST_COLUMNS.map((col) => (
        <View
          key={col}
          style={[
            styles.fastColumnSlot,
            {
              top: FAST_WEEKDAY_BAND_HEIGHT,
              left: `${(col / 7) * 100}%`,
              width: `${100 / 7}%`,
            },
          ]}>
          <View style={styles.fastColumnStripe} />
        </View>
      ))}
    </View>
  );
}

export function CalendarMonthGrid({
  year,
  month,
  today,
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

  const firstFastRowByColumn = Object.fromEntries(
    FAST_COLUMNS.map((col) => [col, getFirstSeasonalFastRowForColumn(weeks, year, month, col)])
  ) as Record<number, number | null>;

  const lastFastRowByColumn = Object.fromEntries(
    FAST_COLUMNS.map((col) => [col, getLastSeasonalFastRowForColumn(weeks, year, month, col)])
  ) as Record<number, number | null>;

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
              <FastColumnStripes />

              <View style={styles.weekdayRow}>
                {weekdays.map((label, col) => {
                  const isFastColumn = (FAST_COLUMNS as readonly number[]).includes(col);
                  return (
                    <View
                      key={label}
                      style={[styles.weekdayCell, isFastColumn && styles.weekdayCellFast]}>
                      <Text style={styles.weekdayLabel}>{label}</Text>
                    </View>
                  );
                })}
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
                            column={col}
                            isToday={isCurrentMonth && dayNum === today.day}
                            bandKind={getDayBandKind(dayNum, year, month)}
                            bandPosition={bandPositions[col]}
                            isFirstFastRowInColumn={
                              firstFastRowByColumn[col] !== null && wi === firstFastRowByColumn[col]
                            }
                            isLastFastRowInColumn={
                              lastFastRowByColumn[col] !== null && wi === lastFastRowByColumn[col]
                            }
                            onPress={() => onSelectDay(dayNum)}
                          />
                        ) : (
                          <View key={`e-${wi}-${col}`} style={styles.dayCell} />
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
  fastColumnLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  fastColumnSlot: {
    position: 'absolute',
    bottom: 0,
  },
  fastColumnStripe: {
    flex: 1,
    backgroundColor: COLORS.fastColumn,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
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
  weekdayCellFast: {
    backgroundColor: COLORS.fastColumn,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
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
  dayBand: {
    width: '100%',
    height: DAY_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fastSeasonBand: {
    backgroundColor: COLORS.fastSeasonFill,
    marginHorizontal: 2,
  },
  dayCell: {
    flex: 1,
    width: '100%',
    height: DAY_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dayBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingBottom: 4,
  },
  dayTodayRing: {
    borderWidth: 1.5,
    borderColor: Palette.gold,
    borderRadius: BorderRadius.sm,
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
    backgroundColor: COLORS.fastSeasonMarker,
  },
});
