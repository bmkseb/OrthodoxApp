import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

type AnimatedSectionProps = {
  children: ReactNode;
  delay?: number;
};

export function AnimatedSection({ children, delay = 0 }: AnimatedSectionProps) {
  return (
    <Animated.View entering={FadeInDown.duration(420).delay(delay).springify().damping(18)}>
      {children}
    </Animated.View>
  );
}
