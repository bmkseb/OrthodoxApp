import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { ExploreCardSurface, useExploreCardTypography } from '@/components/explore/explore-card-chrome';
import { ThemedText } from '@/components/themed-text';
import { Animation, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuickAccessTileProps = {
  title: string;
  subtitle: string;
  icon: IconName;
  width: number;
  onPress: () => void;
};

export function QuickAccessTile({ title, subtitle, icon, width, onPress }: QuickAccessTileProps) {
  const { palette, sacred } = useThemeTokens();
  const type = useExploreCardTypography();
  const pressed = useSharedValue(0);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - Animation.pressScale) }],
  }));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width,
          minHeight: 80,
          paddingHorizontal: Space.s12,
          paddingVertical: Space.s12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Space.s12,
        },
        medallion: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sacred.medallionFill,
          borderWidth: 1,
          borderColor: sacred.medallionRing,
          flexShrink: 0,
        },
        textBlock: {
          flex: 1,
          minWidth: 0,
          gap: 2,
        },
      }),
    [palette, sacred, width]
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: Animation.pressDuration });
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: Animation.pressDuration });
      }}
      style={[{ width }, cardAnimStyle]}>
      <ExploreCardSurface style={styles.card}>
        <View style={styles.medallion}>
          <Icon name={icon} size={18} color={palette.gold} />
        </View>
        <View style={styles.textBlock}>
          <ThemedText style={type.title} numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText style={type.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        </View>
      </ExploreCardSurface>
    </AnimatedPressable>
  );
}
