import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { Opacity } from '@/constants/theme';

/** Radial-style vignette: transparent center, dark edges */
export function VignetteOverlay() {
  return (
    <>
      <LinearGradient
        colors={[`rgba(0,0,0,${Opacity.vignette})`, 'transparent', `rgba(0,0,0,${Opacity.vignette})`]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, styles.pointer]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[`rgba(0,0,0,${Opacity.vignette})`, 'transparent', `rgba(0,0,0,${Opacity.vignette})`]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.pointer]}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  pointer: {
    zIndex: 9999,
  },
});
