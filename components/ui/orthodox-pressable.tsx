import React, { memo, useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Animation } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OrthodoxPressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

function OrthodoxPressableComponent({ style, children, onPressIn, onPressOut, ...rest }: OrthodoxPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withSpring(Animation.pressScale, Animation.pressSpring);
      onPressIn?.(e);
    },
    [onPressIn, scale]
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withSpring(1, Animation.pressSpring);
      onPressOut?.(e);
    },
    [onPressOut, scale]
  );

  return (
    <AnimatedPressable
      {...rest}
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      {children}
    </AnimatedPressable>
  );
}

export const OrthodoxPressable = memo(OrthodoxPressableComponent);
