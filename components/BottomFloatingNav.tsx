import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { FloatingBottom, getTabBarBottom } from '@/constants/floating-bottom';
import { Palette } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { getTabLabel, type TabKey } from '@/lib/translations';
import { IconSymbol } from '@/components/ui/icon-symbol';

type TabIconName = Parameters<typeof IconSymbol>[0]['name'];

const ROUTE_ICONS: Record<TabKey, { focused: TabIconName; unfocused: TabIconName }> = {
  explore: { focused: 'safari.fill', unfocused: 'safari' },
  read: { focused: 'book.fill', unfocused: 'book' },
  learn: { focused: 'graduationcap.fill', unfocused: 'graduationcap' },
  listen: { focused: 'music.note', unfocused: 'music.note' },
  calendar: { focused: 'calendar', unfocused: 'calendar' },
};

const SPRING = { damping: 20, stiffness: 260, mass: 0.9 };

export function BottomFloatingNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { mode } = useTranslation();
  const pillWidth = Dimensions.get('window').width - FloatingBottom.horizontalMargin * 2;
  const tabCount = state.routes.length;
  const tabWidth = pillWidth / tabCount;
  const capsuleInset = 5;
  const capsuleWidth = tabWidth - capsuleInset * 2;

  const capsuleX = useSharedValue(state.index * tabWidth + capsuleInset);

  useEffect(() => {
    capsuleX.value = withSpring(state.index * tabWidth + capsuleInset, SPRING);
  }, [state.index, tabWidth, capsuleInset, capsuleX]);

  const capsuleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: capsuleX.value }],
    width: capsuleWidth,
  }));

  const labels = useMemo(
    () =>
      state.routes.reduce(
        (acc, route) => {
          acc[route.name] = getTabLabel(route.name as TabKey, mode);
          return acc;
        },
        {} as Record<string, string>
      ),
    [state.routes, mode]
  );

  const bottom = getTabBarBottom(insets);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom, left: FloatingBottom.horizontalMargin, right: FloatingBottom.horizontalMargin }]}>
      <View style={styles.pill} pointerEvents="auto">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.glass} />

        <Animated.View style={[styles.capsule, capsuleStyle]} />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const icons = ROUTE_ICONS[route.name as TabKey];
            const iconName = focused ? icons.focused : icons.unfocused;
            const color = focused ? Palette.gold : Palette.muted;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabItem
                key={route.key}
                label={labels[route.name]}
                iconName={iconName}
                color={color}
                focused={focused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabItem({
  label,
  iconName,
  color,
  focused,
  onPress,
}: {
  label: string;
  iconName: TabIconName;
  color: string;
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconWrapStyle = focused ? styles.iconGlow : undefined;

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 14, stiffness: 400 });
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      hitSlop={6}>
      <Animated.View style={[styles.tabInner, pressStyle]}>
        <View style={iconWrapStyle}>
          <IconSymbol name={iconName} size={24} color={color} />
        </View>
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  pill: {
    height: FloatingBottom.tabBarHeight,
    borderRadius: FloatingBottom.tabBarRadius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: { elevation: 14 },
    }),
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(14, 12, 10, 0.88)' : 'rgba(14, 12, 10, 0.94)',
  },
  capsule: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    borderRadius: 28,
    backgroundColor: 'rgba(201, 147, 58, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.32)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  iconGlow: {
    shadowColor: Palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 2,
  },
});
