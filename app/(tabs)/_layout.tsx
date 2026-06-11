import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { TabBarOverlay } from '@/components/navigation/tab-bar-overlay';
import { TabBarPropsProvider, TabBarPropsSync } from '@/contexts/tab-bar-props-context';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useTheme } from '@/contexts/theme-context';
import { getTabLabel, type TabKey } from '@/lib/translations';
import { useTranslation } from '@/hooks/use-translation';

const TAB_KEYS: TabKey[] = ['explore', 'read', 'learn', 'listen', 'calendar'];

export default function TabLayout() {
  const { isFullPlayerOpen } = useAudioPlayer();
  const { mode } = useTranslation();
  const { palette } = useTheme();

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
      sceneStyle: { backgroundColor: palette.background },
      // Collapse the in-navigator tab bar slot; pill renders in TabBarOverlay for reliable taps.
      tabBarStyle: {
        display: 'none' as const,
        position: 'absolute' as const,
        height: 0,
        maxHeight: 0,
        minHeight: 0,
        opacity: 0,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
    }),
    [palette.background]
  );

  return (
    <TabBarPropsProvider>
      <View style={[styles.root, { backgroundColor: palette.background }]}>
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
      </View>
    </TabBarPropsProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
