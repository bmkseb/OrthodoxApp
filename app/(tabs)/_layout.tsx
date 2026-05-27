import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FullScreenPlayer } from '@/components/audio/FullScreenPlayer';
import { FloatingBottomChrome } from '@/components/FloatingBottomChrome';
import { getFloatingChromeHeight } from '@/constants/floating-bottom';
import { Palette } from '@/constants/theme';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { getTabLabel, type TabKey } from '@/lib/translations';
import { useTranslation } from '@/hooks/use-translation';

const TAB_KEYS: TabKey[] = ['explore', 'read', 'learn', 'listen', 'calendar'];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isMiniPlayerVisible } = useAudioPlayer();
  const { mode } = useTranslation();
  const chromeHeight = getFloatingChromeHeight(isMiniPlayerVisible, insets.bottom);

  const labels = useMemo(
    () =>
      TAB_KEYS.reduce(
        (acc, key) => {
          acc[key] = getTabLabel(key, mode);
          return acc;
        },
        {} as Record<TabKey, string>
      ),
    [mode]
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      lazy: false,
      detachInactiveScreens: false,
      sceneStyle: { backgroundColor: Palette.background },
      tabBarStyle: {
        position: 'absolute' as const,
        left: 0,
        right: 0,
        bottom: 0,
        height: chromeHeight,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
      },
    }),
    [chromeHeight]
  );

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={screenOptions}
        tabBar={(props) => (
          <View pointerEvents="box-none" style={styles.tabBarSlot}>
            <FloatingBottomChrome {...props} />
          </View>
        )}>
        <Tabs.Screen name="explore" options={{ title: labels.explore }} />
        <Tabs.Screen name="read" options={{ title: labels.read }} />
        <Tabs.Screen name="learn" options={{ title: labels.learn }} />
        <Tabs.Screen name="listen" options={{ title: labels.listen }} />
        <Tabs.Screen name="calendar" options={{ title: labels.calendar }} />
      </Tabs>
      <FullScreenPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  tabBarSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
