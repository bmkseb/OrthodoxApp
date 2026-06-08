import { Palette } from '@/constants/theme';

/** Shared colors for the month grid and calendar key — keep in sync. */
export const CALENDAR_VISUAL = {
  majorLordBg: 'rgba(249, 168, 37, 0.22)',
  majorMaryBg: 'rgba(21, 101, 192, 0.2)',
  fastColumn: 'rgba(255, 255, 255, 0.04)',
  dotPurple: '#7E57C2',
  dotBlue: '#42A5F5',
  dotGrey: '#9E9E9E',
  dotGold: Palette.gold,
  todayRing: Palette.gold,
} as const;
