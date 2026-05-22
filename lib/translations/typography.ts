import { TextStyle } from 'react-native';
import type { LanguageMode } from './types';

export function getSacredTypography(mode: LanguageMode) {
  const ethiopic = mode === 'am';
  return {
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: ethiopic ? 24 : 22,
      letterSpacing: ethiopic ? 0.25 : 0,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: ethiopic ? 20 : 18,
      letterSpacing: ethiopic ? 0.2 : 0,
    },
    section: {
      fontSize: 22,
      fontWeight: ethiopic ? ('500' as const) : ('600' as const),
      lineHeight: ethiopic ? 30 : 28,
      letterSpacing: ethiopic ? 0.15 : -0.3,
    },
    page: {
      fontSize: 30,
      fontWeight: ethiopic ? ('600' as const) : ('700' as const),
      lineHeight: ethiopic ? 38 : 36,
      letterSpacing: ethiopic ? 0.1 : -0.4,
    },
  };
}

export function getEthiopicTextStyle(mode: LanguageMode): TextStyle {
  if (mode !== 'am') return {};
  return { letterSpacing: 0.35 };
}
