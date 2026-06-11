import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/theme-context';
import { getSacredTokens } from '@/constants/theme';

const WASH_HEIGHT = 120;

/** Page atmosphere — warm vertical depth in light mode; layered wash in dark. */
export function SacredAtmosphere() {
  const { colorScheme, palette } = useTheme();
  const sacred = getSacredTokens(colorScheme);

  if (colorScheme === 'light') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[palette.background, palette.backgroundDeep]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
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
