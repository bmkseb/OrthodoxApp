import Svg, { Circle, Line, Path } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';

type GeometricWatermarkProps = {
  size?: number;
  opacity?: number;
};

/** Faint Orthodox geometric pattern for section headers */
export function GeometricWatermark({ size = 120, opacity = 0.04 }: GeometricWatermarkProps) {
  const stroke = `rgba(201, 147, 58, ${opacity})`;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="48" stroke={stroke} strokeWidth={0.8} fill="none" />
        <Circle cx="60" cy="60" r="32" stroke={stroke} strokeWidth={0.6} fill="none" />
        <Path d="M60 12v96M12 60h96" stroke={stroke} strokeWidth={0.5} />
        <Path d="M24 24l72 72M96 24L24 96" stroke={stroke} strokeWidth={0.4} />
        <Line x1="60" y1="8" x2="60" y2="20" stroke={Palette.gold} strokeWidth={1} opacity={opacity * 2} />
        <Line x1="52" y1="16" x2="68" y2="16" stroke={Palette.gold} strokeWidth={1} opacity={opacity * 2} />
        <Line x1="60" y1="100" x2="60" y2="112" stroke={Palette.gold} strokeWidth={1} opacity={opacity * 2} />
        <Line x1="52" y1="104" x2="68" y2="104" stroke={Palette.gold} strokeWidth={1} opacity={opacity * 2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: -20,
    top: -30,
    opacity: 1,
  },
});
