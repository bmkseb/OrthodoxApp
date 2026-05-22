import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { Layout } from '@/constants/theme';

type RadialCardSurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function RadialCardSurface({ children, style }: RadialCardSurfaceProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <LinearGradient
        colors={[ManuscriptTokens.cardWarmStart, ManuscriptTokens.cardWarmMid, ManuscriptTokens.cardWarmEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(201, 147, 58, 0.08)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, styles.sideGlow]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderColor: ManuscriptTokens.cardBorder,
    overflow: 'hidden',
    shadowColor: ManuscriptTokens.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: ManuscriptTokens.shadowOpacity,
    shadowRadius: 12,
    elevation: 4,
  },
  sideGlow: {
    opacity: 0.6,
  },
});
