import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { FullScreenPlayer } from '@/components/audio/FullScreenPlayer';
import { TabBarOverlay } from '@/components/navigation/tab-bar-overlay';
import { Palette } from '@/constants/theme';
import { TabBarPropsProvider, TabBarPropsSync } from '@/contexts/tab-bar-props-context';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { getTabLabel, type TabKey } from '@/lib/translations';
import { useTranslation } from '@/hooks/use-translation';

const TAB_KEYS: TabKey[] = ['explore', 'read', 'learn', 'listen', 'calendar'];

export default function TabLayout() {
  const { isFullPlayerOpen } = useAudioPlayer();
  const { mode } = useTranslation();

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
      // Hide the in-navigator tab bar slot — it still captures touches on device.
      // Chrome renders in TabBarOverlay; scroll padding uses useFloatingBottomInset().
      tabBarStyle: { display: 'none' as const },
    }),
    []
  );

  return (
    <TabBarPropsProvider>
      <View style={styles.root}>
        <Tabs
          screenOptions={screenOptions}
          tabBar={(props) => <TabBarPropsSync {...props} />}>
          <Tabs.Screen name="explore" options={{ title: labels.explore }} />
          <Tabs.Screen name="read" options={{ title: labels.read }} />
          <Tabs.Screen name="learn" options={{ title: labels.learn }} />
          <Tabs.Screen name="listen" options={{ title: labels.listen }} />
          <Tabs.Screen name="calendar" options={{ title: labels.calendar }} />
        </Tabs>
        {!isFullPlayerOpen ? <TabBarOverlay /> : null}
        {isFullPlayerOpen ? <FullScreenPlayer /> : null}
      </View>
    </TabBarPropsProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
});
