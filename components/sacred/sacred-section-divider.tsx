import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Space } from '@/constants/theme';

const LINE_EDGE = 'transparent';
const LINE_MID = 'rgba(201, 147, 58, 0.24)';

/** Ceremonial section break — fading gold hairlines, centered Ethiopian cross (✛). */
export function SacredSectionDivider() {
  return (
    <View style={styles.wrap} pointerEvents="none" accessibilityElementsHidden>
      <View style={styles.lineSlot}>
        <LinearGradient
          colors={[LINE_EDGE, 'rgba(201, 147, 58, 0.1)', LINE_MID, 'rgba(201, 147, 58, 0.1)', LINE_EDGE]}
          locations={[0, 0.18, 0.5, 0.82, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.line}
        />
      </View>
      <View style={styles.crossWrap}>
        <View style={styles.crossGlow} />
        <Text style={styles.cross}>✛</Text>
      </View>
      <View style={styles.lineSlot}>
        <LinearGradient
          colors={[LINE_EDGE, 'rgba(201, 147, 58, 0.1)', LINE_MID, 'rgba(201, 147, 58, 0.1)', LINE_EDGE]}
          locations={[0, 0.18, 0.5, 0.82, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.line}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Space.s12,
    marginBottom: Space.s12,
    gap: Space.s12,
  },
  lineSlot: {
    flex: 1,
    height: 1,
    justifyContent: 'center',
  },
  line: {
    height: StyleSheet.hairlineWidth * 2,
    width: '100%',
  },
  crossWrap: {
    paddingHorizontal: Space.s12,
    paddingVertical: Space.s4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    shadowColor: '#C9933A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  cross: {
    fontSize: 16,
    color: 'rgba(201, 147, 58, 0.55)',
    lineHeight: 18,
    fontWeight: '300',
    textAlign: 'center',
  },
});
