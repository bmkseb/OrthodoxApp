import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const MOTIF_SIZE = 15;
const MOTIF_GOLD_OPACITY = 0.6;

/**
 * Ceremonial break between major sections.
 * Vertical rhythm: sectionGapBefore + sectionGapAfter = Layout.sectionGap (40px).
 */
export function LiturgicalSectionDivider() {
  const { palette } = useThemeTokens();
  const lineColor = palette.border;
  const fadeMid = `${lineColor}55`;

  return (
    <View style={styles.wrap} pointerEvents="none" accessibilityElementsHidden>
      <LinearGradient
        colors={[lineColor, fadeMid, 'transparent']}
        locations={[0, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
      <Text style={[styles.motif, { color: palette.gold, opacity: MOTIF_GOLD_OPACITY }]}>✛</Text>
      <LinearGradient
        colors={['transparent', fadeMid, lineColor]}
        locations={[0, 0.28, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.sectionGapBefore,
    marginBottom: Layout.sectionGapAfter,
    gap: Space.s8,
  },
  line: {
    flex: 1,
    height: 1,
  },
  motif: {
    fontSize: MOTIF_SIZE,
    lineHeight: MOTIF_SIZE + 2,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
