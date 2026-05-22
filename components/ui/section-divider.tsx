import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Layout, Opacity } from '@/constants/theme';

export function SectionDivider() {
  return (
    <LinearGradient
      colors={['transparent', `rgba(201, 147, 58, ${Opacity.dividerGold})`, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.divider}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginBottom: Layout.sectionGap,
  },
});
