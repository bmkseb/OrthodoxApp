import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { GLOSSY_CARD_GRADIENT_LOCATIONS, getGlossyCardGradient } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

/** Glossy card interior — one soft vertical pass, no center cross spotlight. */
export const GlossyCardGradientFill = memo(function GlossyCardGradientFill() {
  const { palette, colorScheme } = useThemeTokens();
  const colors = getGlossyCardGradient(palette, colorScheme);

  return (
    <LinearGradient
      colors={[...colors]}
      locations={[...GLOSSY_CARD_GRADIENT_LOCATIONS]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
});
