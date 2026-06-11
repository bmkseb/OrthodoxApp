import { useMemo } from 'react';

import { getLayoutTokens, getSacredTokens, getShadows } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

/** Active palette, shadows, sacred tokens, and layout tokens for the current color scheme. */
export function useThemeTokens() {
  const { palette, colorScheme } = useTheme();

  return useMemo(
    () => ({
      palette,
      sacred: getSacredTokens(colorScheme),
      shadows: getShadows(colorScheme),
      layout: getLayoutTokens(palette),
      colorScheme,
    }),
    [palette, colorScheme]
  );
}
