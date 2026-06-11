import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { FloatingBottom, getTabBarBottom } from '@/constants/floating-bottom';
import { Animation } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
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
const MEDALLION_SIZE = 44;

export function BottomFloatingNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { mode } = useTranslation();
  const { palette, colorScheme } = useTheme();
  const { sacred, shadows } = useThemeTokens();

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
      <View
        style={[
          styles.pill,
          {
            borderColor: palette.border,
            backgroundColor: colorScheme === 'light' ? palette.surface : palette.card,
          },
          shadows.floatingNav,
        ]}
        pointerEvents="auto">
        <View style={[styles.topHairline, { backgroundColor: sacred.tabBarHairline }]} />
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={colorScheme === 'light' ? 72 : 80}
            tint={colorScheme === 'light' ? 'light' : 'dark'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          style={[
            styles.glass,
            {
              backgroundColor:
                colorScheme === 'light' ? 'rgba(255, 255, 255, 0.88)' : palette.navGlass,
            },
          ]}
        />
        <View style={[styles.bottomGlow, { backgroundColor: sacred.tabBarHairline }]} />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const icons = ROUTE_ICONS[route.name as TabKey];
            const iconName = focused ? icons.focused : icons.unfocused;
            const color = focused ? palette.gold : palette.muted;

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
                sacred={sacred}
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
  sacred,
}: {
  label: string;
  iconName: TabIconName;
  color: string;
  focused: boolean;
  onPress: () => void;
  sacred: ReturnType<typeof useThemeTokens>['sacred'];
}) {
  const scale = useSharedValue(1);
  const medallionOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    medallionOpacity.value = withTiming(focused ? 1 : 0, { duration: Animation.tabMedallionMs });
  }, [focused, medallionOpacity]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const medallionStyle = useAnimatedStyle(() => ({
    opacity: medallionOpacity.value,
  }));

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(Animation.pressScale, { damping: 18, stiffness: 420 });
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
        <View style={styles.iconSlot}>
          <Animated.View
            style={[
              styles.medallion,
              {
                backgroundColor: sacred.medallionFill,
                borderColor: sacred.medallionRing,
              },
              medallionStyle,
            ]}
          />
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
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: StyleSheet.hairlineWidth,
    zIndex: 4,
    opacity: 0.5,
  },
  topHairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 4,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
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
  iconSlot: {
    width: MEDALLION_SIZE,
    height: MEDALLION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallion: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: MEDALLION_SIZE / 2,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
