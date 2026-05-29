import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomFloatingNav } from '@/components/BottomFloatingNav';
import { FloatingMiniPlayer } from '@/components/FloatingMiniPlayer';
import { getFloatingChromeHeight } from '@/constants/floating-bottom';
import { usePlayback } from '@/contexts/playback-context';

/** Tab bar slot: mini player + floating pill nav as one bottom control system. */
export function FloatingBottomChrome(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isMiniPlayerVisible } = usePlayback();
  const height = getFloatingChromeHeight(isMiniPlayerVisible, insets.bottom);

  return (
    <View style={[styles.host, { height }]} pointerEvents="box-none">
      <FloatingMiniPlayer />
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
