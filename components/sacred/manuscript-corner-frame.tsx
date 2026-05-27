import { StyleSheet, View } from 'react-native';

import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';

type ManuscriptCornerFrameProps = {
  inset?: number;
  opacity?: number;
};

/** Subtle manuscript-style corner brackets */
export function ManuscriptCornerFrame({ inset = 10, opacity = 0.3 }: ManuscriptCornerFrameProps) {
  const border = {
    borderColor: `rgba(201, 147, 58, ${opacity})`,
  };

  return (
    <>
      <View style={[styles.corner, border, { top: inset, left: inset, borderTopWidth: 1, borderLeftWidth: 1 }]} />
      <View style={[styles.corner, border, { top: inset, right: inset, borderTopWidth: 1, borderRightWidth: 1 }]} />
      <View style={[styles.corner, border, { bottom: inset, left: inset, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
      <View
        style={[styles.corner, border, { bottom: inset, right: inset, borderBottomWidth: 1, borderRightWidth: 1 }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    zIndex: 2,
  },
});
