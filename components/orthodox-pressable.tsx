import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OrthodoxPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  children: React.ReactNode;
};

export function OrthodoxPressable({
  style,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: OrthodoxPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.value = withSpring(Animation.pressScale, Animation.pressSpring);
        opacity.value = withTiming(Animation.pressOpacity, { duration: Animation.pressDuration });
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, Animation.pressSpring);
        opacity.value = withTiming(1, { duration: Animation.pressDuration });
        onPressOut?.(e);
      }}
      onPress={onPress}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
}
