import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

type EthiopicCrossWatermarkProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Faint sacred cross glyph backdrop used on auth and profile surfaces. */
export function EthiopicCrossWatermark({ size = 220, style }: EthiopicCrossWatermarkProps) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none" accessibilityElementsHidden>
      <Text style={[styles.cross, { fontSize: size, lineHeight: size }]}>☩</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    color: Palette.gold,
    opacity: 0.04,
    fontWeight: '300',
    textAlign: 'center',
  },
});
