import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeTokens } from '@/hooks/use-theme-tokens';

type EthiopicCrossWatermarkProps = {
  size?: number;
  /** 0–1, default very faint */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

/** Faint Ethiopian cross backdrop — nave wall, not decoration. */
export function EthiopicCrossWatermark({
  size = 220,
  opacity = 0.045,
  style,
}: EthiopicCrossWatermarkProps) {
  const { palette } = useThemeTokens();

  return (
    <View style={[styles.wrap, style]} pointerEvents="none" accessibilityElementsHidden>
      <Text
        style={[
          styles.cross,
          {
            fontSize: size,
            lineHeight: size,
            color: palette.gold,
            opacity,
          },
        ]}>
        ☩
      </Text>
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
    justifyContent: 'flex-start',
    paddingTop: 72,
  },
  cross: {
    fontWeight: '300',
    textAlign: 'center',
  },
});
