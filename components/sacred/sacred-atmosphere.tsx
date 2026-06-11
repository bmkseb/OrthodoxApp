import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/theme-context';
import { getSacredTokens } from '@/constants/theme';

const WASH_HEIGHT = 120;

/** Page atmosphere — neutral base with a very subtle top lift (no heavy brown wash). */
export function SacredAtmosphere() {
  const { colorScheme, palette } = useTheme();
  const sacred = getSacredTokens(colorScheme);

  if (colorScheme === 'light') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.background }]} />
        <LinearGradient
          colors={[sacred.pageWashTop, palette.background]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topWash}
        />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.backgroundDeep }]} />
      <LinearGradient
        colors={[palette.background, palette.backgroundDeep]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[sacred.pageWashTop, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topWash}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: WASH_HEIGHT,
  },
});
