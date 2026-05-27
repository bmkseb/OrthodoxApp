import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Layout } from '@/constants/theme';

type SoftSeparatorProps = {
  marginVertical?: number;
};

/** Faded gold separator — softer than a hard 1px line */
export function SoftSeparator({ marginVertical = Layout.sectionGap }: SoftSeparatorProps) {
  return (
    <View style={[styles.wrap, { marginVertical }]}>
      <LinearGradient
        colors={['transparent', 'rgba(201, 147, 58, 0.14)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  line: {
    height: StyleSheet.hairlineWidth,
    minHeight: 1,
  },
});
