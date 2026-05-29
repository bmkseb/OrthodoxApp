import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Palette } from '@/constants/theme';

// TODO: Replace with properly licensed Ethiopian Orthodox imagery
// (rock-hewn churches of Lalibela, traditional chant manuscripts, debtera
// with sistrum, authentic Trinity iconography, etc.). These gradient + motif
// placeholders exist so the app never falls back to culturally inappropriate
// or off-brand stock imagery.

type Variant = 'liturgy' | 'trinity';

type SacredImagePlaceholderProps = {
  variant: Variant;
  style?: StyleProp<ViewStyle>;
};

const GRADIENTS: Record<Variant, [string, string]> = {
  // Warm liturgical wash for the Yared melodies card.
  liturgy: ['#2B1810', '#1A1815'],
  // Mirror of the liturgy wash for the Trinity card so the two read as
  // a matched pair when both placeholders appear in-app.
  trinity: ['#1A1815', '#2B1810'],
};

export function SacredImagePlaceholder({ variant, style }: SacredImagePlaceholderProps) {
  const [from, to] = GRADIENTS[variant];

  return (
    <View style={[styles.root, style]} pointerEvents="none">
      <LinearGradient colors={[from, to]} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        {variant === 'liturgy' ? <LiturgyMotif /> : <TrinityMotif />}
      </View>
    </View>
  );
}

function LiturgyMotif() {
  return (
    <Text style={styles.cross} allowFontScaling={false}>
      ☩
    </Text>
  );
}

/**
 * Stylized Ethiopian Trinity silhouette — three identical robed figures
 * (haloed head + flared robe), evenly spaced. Each figure shares the same
 * geometry to honor the equal-persons motif found in traditional ሥላሴ icons.
 */
function TrinityMotif() {
  const FIGURE_GOLD = Palette.gold;
  const FIGURE_OPACITY = 0.4;

  return (
    <Svg width={160} height={120} viewBox="0 0 160 120">
      {[20, 60, 100].map((x) => (
        <React.Fragment key={x}>
          {/* Halo */}
          <Circle
            cx={x + 20}
            cy={26}
            r={9}
            fill="none"
            stroke={FIGURE_GOLD}
            strokeWidth={1.2}
            opacity={FIGURE_OPACITY}
          />
          {/* Head */}
          <Circle cx={x + 20} cy={26} r={6} fill={FIGURE_GOLD} opacity={FIGURE_OPACITY} />
          {/* Robe — narrow shoulders flaring to a wide hem */}
          <Path
            d={`M${x + 14} 36 L${x + 26} 36 L${x + 34} 108 L${x + 6} 108 Z`}
            fill={FIGURE_GOLD}
            opacity={FIGURE_OPACITY}
          />
          {/* Faint cross over the heart */}
          <Path
            d={`M${x + 20} 54 L${x + 20} 70 M${x + 16} 60 L${x + 24} 60`}
            stroke={FIGURE_GOLD}
            strokeWidth={1.1}
            opacity={FIGURE_OPACITY * 0.9}
            strokeLinecap="round"
          />
        </React.Fragment>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cross: {
    fontSize: 96,
    color: Palette.gold,
    opacity: 0.3,
    lineHeight: 104,
  },
});
