import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeTokens } from '@/hooks/use-theme-tokens';

const RULE_WIDTH = 40;
const MOTIF_SIZE = 8;

/** Centered gold rule with tiny cross — inside scripture display cards. */
export function ScriptureOrnamentRule() {
  const { palette, sacred } = useThemeTokens();
  const lineColor = sacred.scriptureFrameOuter;
  const fadeMid = `${lineColor}66`;

  return (
    <View style={styles.wrap} pointerEvents="none" accessibilityElementsHidden>
      <LinearGradient
        colors={['transparent', fadeMid, lineColor]}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.segment}
      />
      <Text style={[styles.motif, { color: palette.gold }]}>◆</Text>
      <LinearGradient
        colors={[lineColor, fadeMid, 'transparent']}
        locations={[0, 0.65, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.segment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: RULE_WIDTH,
    gap: 2,
  },
  segment: {
    flex: 1,
    height: 1,
  },
  motif: {
    fontSize: MOTIF_SIZE,
    lineHeight: MOTIF_SIZE + 2,
    opacity: 0.65,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
