import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingBottomChrome } from '@/components/FloatingBottomChrome';
import { useTabBarProps } from '@/contexts/tab-bar-props-context';

/**
 * Renders floating tab chrome above all tab scenes so touches reach the nav on
 * physical devices (Expo Go) where in-navigator tab bars lose to GH ScrollViews.
 */
export function TabBarOverlay() {
  const tabBarProps = useTabBarProps();
  if (!tabBarProps) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <FloatingBottomChrome {...tabBarProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
});
