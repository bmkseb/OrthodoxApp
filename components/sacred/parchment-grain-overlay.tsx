import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';

type ParchmentGrainOverlayProps = {
  style?: StyleProp<ViewStyle>;
};

export function ParchmentGrainOverlay({ style }: ParchmentGrainOverlayProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, style]}>
      <View style={styles.grainLayer} />
      <View style={styles.noiseLayer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 236, 215, 0.04)',
    opacity: ManuscriptTokens.grainOpacity,
  },
  noiseLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201, 147, 58, 0.012)',
    opacity: ManuscriptTokens.grainOpacity,
  },
});
