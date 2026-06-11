import type { IconName } from '@/components/Icon';
import {
  Opacity,
  Palette,
  PaletteDark,
  type AppPalette,
  type ColorScheme,
} from '@/constants/theme';
import { SEASONS, type SeasonKey } from '@/lib/calendar-content';

/** Shared colors for the month grid, calendar key, and catalog rails — theme-aware. */
export function getCalendarVisual(palette: AppPalette, colorScheme: ColorScheme) {
  const light = colorScheme === 'light';
  return {
    majorLordBg: light ? 'rgba(249, 168, 37, 0.18)' : 'rgba(249, 168, 37, 0.16)',
    majorMaryBg: light ? 'rgba(21, 101, 192, 0.12)' : 'rgba(21, 101, 192, 0.14)',
    saintFeastBg: light ? 'rgba(126, 87, 194, 0.12)' : 'rgba(126, 87, 194, 0.14)',
    fastColumn: light ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.04)',
    fastSeasonFill: 'rgba(201, 147, 58, 0.05)',
    fastSeasonBorder: 'rgba(201, 147, 58, 0.22)',
    feastLordBorder: 'rgba(249, 168, 37, 0.32)',
    feastMaryBorder: 'rgba(21, 101, 192, 0.28)',
    weekdayFastBorder: light ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    /** Gold accent bar under plain fast days (when no feast dot). */
    fastSeasonMarker: 'rgba(201, 147, 58, 0.6)',
    /** Thin underline — Wednesday & Friday fasts. */
    fastWeekdayLine: 'rgba(201, 147, 58, 0.6)',
    /** Thicker underline — major fasting seasons. */
    fastSeasonLine: 'rgba(201, 147, 58, 0.65)',
    /** Full-opacity underline when the day is selected. */
    fastLineActive: palette.gold,
    selectedCellBg: 'rgba(201, 147, 58, 0.1)',
    selectedCellBorder: palette.gold,
    todayCellBorder: 'rgba(201, 147, 58, 0.38)',
    dotPurple: '#7E57C2',
    dotBlue: '#42A5F5',
    dotGrey: light ? '#757575' : '#9E9E9E',
    dotGold: palette.gold,
    todayRing: palette.gold,
  } as const;
}

/** @deprecated Use getCalendarVisual — static fallback (dark values). */
export const CALENDAR_VISUAL = getCalendarVisual(PaletteDark, 'dark');

export type FastIndicatorLevel = 'weekday' | 'seasonal';

export function getFastIndicatorLevel(
  isFasting: boolean,
  fastingReason: string | null
): FastIndicatorLevel | null {
  if (!isFasting || fastingReason == null) return null;
  if (fastingReason === 'Wednesday' || fastingReason === 'Friday') return 'weekday';
  return 'seasonal';
}

export function getCalendarRail(palette: AppPalette, colorScheme: ColorScheme) {
  return {
    cardGradient: [palette.surfaceWarm, palette.surface, palette.backgroundDeep] as const,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
    iconBackdrop: colorScheme === 'light' ? 'rgba(237, 230, 216, 0.85)' : 'rgba(11, 9, 7, 0.55)',
    badgeBg: colorScheme === 'light' ? 'rgba(237, 230, 216, 0.85)' : 'rgba(11, 9, 7, 0.55)',
    badgeActiveBg: 'rgba(201, 147, 58, 0.05)',
  } as const;
}

/** @deprecated Use getCalendarRail — static fallback. */
export const CALENDAR_RAIL = getCalendarRail(Palette, 'light');

const FAST_RAIL_ICONS: Partial<Record<SeasonKey, IconName>> = {
  lent: 'cross',
  holyWeek: 'cross',
  nineveh: 'moon',
  advent: 'moon',
  apostlesFast: 'flame',
  marysFast: 'heart',
};

export type CalendarRailAccent = {
  accentColor: string;
  icon: IconName;
  panelTint: string;
};

export function getFastRailAccent(key: string): CalendarRailAccent {
  const seasonKey = key as SeasonKey;
  const season = SEASONS[seasonKey];

  return {
    accentColor: season?.color ?? Palette.gold,
    icon: FAST_RAIL_ICONS[seasonKey] ?? 'flame',
    panelTint: CALENDAR_VISUAL.fastSeasonFill,
  };
}

export function getFeastRailAccent(type: string): CalendarRailAccent {
  switch (type) {
    case 'marian':
      return {
        accentColor: CALENDAR_VISUAL.dotBlue,
        icon: 'heart',
        panelTint: CALENDAR_VISUAL.majorMaryBg,
      };
    case 'saint':
      return {
        accentColor: CALENDAR_VISUAL.dotPurple,
        icon: 'church',
        panelTint: CALENDAR_VISUAL.saintFeastBg,
      };
    default:
      return {
        accentColor: Palette.gold,
        icon: 'cross',
        panelTint: CALENDAR_VISUAL.majorLordBg,
      };
  }
}
