import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Opacity } from '@/constants/theme';

type VignetteOverlayProps = {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
};

export function VignetteOverlay({ style, intensity = Opacity.vignette }: VignetteOverlayProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={[`rgba(0,0,0,${intensity})`, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', `rgba(0,0,0,${Math.min(intensity + 0.2, 0.85)})`]}
        start={{ x: 0.5, y: 0.45 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`rgba(0,0,0,${intensity * 0.6})`, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.25, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', `rgba(0,0,0,${intensity * 0.6})`]}
        start={{ x: 0.75, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
