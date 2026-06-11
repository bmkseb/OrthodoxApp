import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CALENDAR_VISUAL, type FastIndicatorLevel } from '@/lib/calendar-visual';
import { BorderRadius } from '@/constants/theme';

type FastDayUnderlineProps = {
  level: FastIndicatorLevel;
  selected?: boolean;
  /** Fade in when the month grid mounts or the level changes. */
  animate?: boolean;
};

export function FastDayUnderline({
  level,
  selected = false,
  animate = true,
}: FastDayUnderlineProps) {
  const opacity = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) {
      opacity.value = 1;
      return;
    }
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 360 });
  }, [animate, level, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isSeasonal = level === 'seasonal';

  return (
    <Animated.View
      style={[
        styles.base,
        isSeasonal ? styles.seasonal : styles.weekday,
        {
          backgroundColor: selected
            ? CALENDAR_VISUAL.fastLineActive
            : isSeasonal
              ? CALENDAR_VISUAL.fastSeasonLine
              : CALENDAR_VISUAL.fastWeekdayLine,
        },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.sm,
    marginTop: 3,
  },
  weekday: {
    width: 14,
    height: 2,
  },
  seasonal: {
    width: 18,
    height: 3,
  },
});
