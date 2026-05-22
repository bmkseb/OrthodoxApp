import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OrthodoxPressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function OrthodoxPressable({
  children,
  style,
  disabled,
  onPressIn,
  onPressOut,
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
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(Animation.pressScale, Animation.pressSpring);
          opacity.value = Animation.pressOpacity;
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, Animation.pressSpring);
        opacity.value = 1;
        onPressOut?.(event);
      }}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
}
