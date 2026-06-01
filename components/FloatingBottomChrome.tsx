import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomFloatingNav } from '@/components/BottomFloatingNav';
import { getFloatingChromeHeight } from '@/constants/floating-bottom';

/** Tab bar slot: floating pill nav (mini player renders globally). */
export function FloatingBottomChrome(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const height = getFloatingChromeHeight(false, insets.bottom);

  return (
    <View style={[styles.host, { height }]} pointerEvents="box-none">
      <BottomFloatingNav {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
});
