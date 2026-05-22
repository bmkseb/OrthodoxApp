import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { Opacity } from '@/constants/theme';

type GeometricWatermarkProps = {
  style?: StyleProp<ViewStyle>;
  size?: number;
};

export function GeometricWatermark({ style, size = 52 }: GeometricWatermarkProps) {
  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]} />
      <Text style={[styles.cross, { fontSize: size * 0.55 }]}>☩</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: ManuscriptTokens.fadedGold,
    opacity: Opacity.watermark,
  },
  cross: {
    color: ManuscriptTokens.watermarkCross,
    opacity: Opacity.watermark,
    lineHeight: undefined,
  },
});
