import { PaletteLight, type AppPalette, type ColorScheme } from '@/constants/theme';

/** Shared colors for the month grid and calendar key — theme-aware. */
export function getCalendarVisual(palette: AppPalette, colorScheme: ColorScheme) {
  return {
    majorLordBg:
      colorScheme === 'light' ? 'rgba(249, 168, 37, 0.18)' : 'rgba(249, 168, 37, 0.22)',
    majorMaryBg:
      colorScheme === 'light' ? 'rgba(21, 101, 192, 0.12)' : 'rgba(21, 101, 192, 0.2)',
    fastColumn:
      colorScheme === 'light' ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.04)',
    dotPurple: '#7E57C2',
    dotBlue: '#42A5F5',
    dotGrey: colorScheme === 'light' ? '#757575' : '#9E9E9E',
    dotGold: palette.gold,
    todayRing: palette.gold,
  } as const;
}

/** @deprecated Use getCalendarVisual — static fallback for legend modal compile-time data. */
export const CALENDAR_VISUAL = {
  majorLordBg: 'rgba(249, 168, 37, 0.18)',
  majorMaryBg: 'rgba(21, 101, 192, 0.12)',
  fastColumn: 'rgba(0, 0, 0, 0.025)',
  dotPurple: '#7E57C2',
  dotBlue: '#42A5F5',
  dotGrey: '#757575',
  dotGold: PaletteLight.gold,
  todayRing: PaletteLight.gold,
} as const;
