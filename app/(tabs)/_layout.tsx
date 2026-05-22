import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { useTranslation } from '@/hooks/use-translation';
import { getTabLabel, type TabKey } from '@/lib/translations';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';

const TAB_KEYS: TabKey[] = ['explore', 'read', 'learn', 'listen', 'calendar'];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: Parameters<typeof IconSymbol>[0]['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={focused ? styles.iconGlow : undefined}>
      <IconSymbol size={26} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
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
      tabBarActiveTintColor: Palette.gold,
      tabBarInactiveTintColor: Palette.muted,
      headerShown: false,
      tabBarButton: HapticTab,
      lazy: false,
      detachInactiveScreens: false,
      sceneStyle: { backgroundColor: Palette.background },
      tabBarStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderTopWidth: 0,
        elevation: 0,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 8 : 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500' as const,
        letterSpacing: mode === 'am' ? 0.15 : 0,
      },
      tabBarItemStyle: { paddingVertical: 4 },
      tabBarBackground: () => (
        <BlurView
          intensity={60}
          tint="dark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        />
      ),
    }),
    [mode]
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="explore"
        options={{
          title: labels.explore,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'safari.fill' : 'safari'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          title: labels.read,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'book.fill' : 'book'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: labels.learn,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'graduationcap.fill' : 'graduationcap'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="listen"
        options={{
          title: labels.listen,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="music.note" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: labels.calendar,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconGlow: {
    shadowColor: Palette.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});
