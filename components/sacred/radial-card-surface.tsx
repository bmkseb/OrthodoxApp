import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Palette } from '@/constants/theme';

type RadialCardSurfaceProps = ViewProps & {
  children: React.ReactNode;
  tint?: 'warm' | 'cool' | 'neutral';
};

const TINTS = {
  warm: ['#1A1612', '#12100E', '#0A0908'] as const,
  cool: ['#141820', '#0E1014', '#080A0C'] as const,
  neutral: ['#161412', '#100E0C', '#0A0908'] as const,
};

/** Radial-style depth so surfaces never read as flat black */
export function RadialCardSurface({ children, tint = 'neutral', style, ...rest }: RadialCardSurfaceProps) {
  const colors = TINTS[tint];

  return (
    <View style={[styles.wrap, style]} {...rest}>
      <LinearGradient
        colors={[colors[0], colors[1], colors[2]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(201, 147, 58, 0.06)', 'transparent', 'rgba(201, 147, 58, 0.03)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <ParchmentGrainOverlayInline />
      {children}
    </View>
  );
}

function ParchmentGrainOverlayInline() {
  return <View style={styles.inlineGrain} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: Palette.card,
  },
  inlineGrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 236, 215, 0.015)',
  },
});
