import { Opacity, Palette } from '@/constants/theme';

export const ManuscriptTokens = {
  parchmentWash: 'rgba(245, 236, 215, 0.06)',
  parchmentHighlight: 'rgba(245, 236, 215, 0.12)',
  parchmentMuted: 'rgba(245, 236, 215, 0.75)',
  fadedGold: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  fadedGoldStrong: 'rgba(201, 147, 58, 0.65)',
  fadedGoldSubtle: `rgba(201, 147, 58, ${Opacity.goldBorderSubtle})`,
  cornerBracket: `rgba(201, 147, 58, ${Opacity.goldBorderSubtle})`,
  warmShadow: 'rgba(30, 26, 20, 0.85)',
  cardWarmStart: '#2A241C',
  cardWarmMid: '#1E1A14',
  cardWarmEnd: '#14120E',
  grainOpacity: 0.02,
  imageSoftening: 0.9,
  progressGlow: 'rgba(201, 147, 58, 0.65)',
  watermarkCross: `rgba(201, 147, 58, ${Opacity.watermark})`,
  separatorFade: `rgba(201, 147, 58, ${Opacity.dividerGold})`,
  mutedText: Palette.muted,
  cardBorder: `rgba(201, 147, 58, ${Opacity.goldBorder})`,
  shadowColor: '#000000',
  shadowOpacity: 0.12,
} as const;
