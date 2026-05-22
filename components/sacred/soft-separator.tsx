import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { Layout } from '@/constants/theme';

type SoftSeparatorProps = {
  style?: StyleProp<ViewStyle>;
};

export function SoftSeparator({ style }: SoftSeparatorProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['transparent', ManuscriptTokens.separatorFade, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.sectionGap / 2,
    alignItems: 'center',
  },
  line: {
    height: 1,
    width: '100%',
  },
});
