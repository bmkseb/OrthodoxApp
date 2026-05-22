import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';

type ManuscriptCornerFrameProps = {
  style?: StyleProp<ViewStyle>;
  inset?: number;
};

export function ManuscriptCornerFrame({ style, inset = 10 }: ManuscriptCornerFrameProps) {
  const cornerStyle = {
    width: 14,
    height: 14,
    borderColor: ManuscriptTokens.cornerBracket,
  };

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <View style={[styles.corner, cornerStyle, { top: inset, left: inset, borderTopWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, cornerStyle, { top: inset, right: inset, borderTopWidth: 1, borderRightWidth: 1 }]} />
      <View style={[styles.corner, cornerStyle, { bottom: inset, left: inset, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, cornerStyle, { bottom: inset, right: inset, borderBottomWidth: 1, borderRightWidth: 1 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
  },
});
