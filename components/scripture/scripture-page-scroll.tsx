import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, View, type ScrollViewProps } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

const THUMB_MIN_HEIGHT = 24;
const THUMB_MAX_HEIGHT = 48;
const TRACK_RIGHT = 3;
const THUMB_WIDTH = 3;
const HIDE_DELAY_MS = 900;

type ScripturePageScrollProps = ScrollViewProps & {
  children: ReactNode;
  /** Space at the top of the viewport the thumb should stay below (e.g. safe-area inset). */
  trackInsetTop?: number;
  /** Space at the bottom of the viewport the thumb should stay above (e.g. nav bar). */
  trackInsetBottom?: number;
};

/**
 * Scripture scroll view with a custom right-edge position indicator that appears
 * while the reader is scrolling and fades out shortly after scrolling stops.
 */
export const ScripturePageScroll = forwardRef<Animated.ScrollView, ScripturePageScrollProps>(
  function ScripturePageScroll(
    { children, trackInsetTop = 0, trackInsetBottom = 0, onScroll, ...rest },
    ref
  ) {
    const scrollY = useSharedValue(0);
    const contentHeight = useSharedValue(1);
    const layoutHeight = useSharedValue(1);
    const active = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
      onBeginDrag: () => {
        active.value = withTiming(1, { duration: 120 });
      },
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
        contentHeight.value = event.contentSize.height;
        layoutHeight.value = event.layoutMeasurement.height;
        active.value = 1;
      },
      onEndDrag: () => {
        active.value = withDelay(HIDE_DELAY_MS, withTiming(0, { duration: 400 }));
      },
      onMomentumEnd: () => {
        active.value = withDelay(HIDE_DELAY_MS, withTiming(0, { duration: 400 }));
      },
    });

    const thumbStyle = useAnimatedStyle(() => {
      const trackHeight = Math.max(layoutHeight.value - trackInsetTop - trackInsetBottom, 1);
      const visibleRatio = Math.min(layoutHeight.value / Math.max(contentHeight.value, 1), 1);
      const thumbHeight = Math.min(
        Math.max(visibleRatio * trackHeight, THUMB_MIN_HEIGHT),
        THUMB_MAX_HEIGHT
      );
      const maxScroll = Math.max(contentHeight.value - layoutHeight.value, 1);
      const progress = Math.min(Math.max(scrollY.value / maxScroll, 0), 1);
      const translateY = trackInsetTop + progress * (trackHeight - thumbHeight);

      return {
        height: thumbHeight,
        opacity: active.value,
        transform: [{ translateY }],
      };
    });

    const trackStyle = useAnimatedStyle(() => ({
      opacity: active.value * 0.35,
      top: trackInsetTop,
      bottom: trackInsetBottom,
    }));

    return (
      <View style={styles.root}>
        <Animated.ScrollView {...rest} ref={ref} onScroll={scrollHandler} scrollEventThrottle={16}>
          {children}
        </Animated.ScrollView>

        <View style={styles.overlay} pointerEvents="none">
          <Animated.View style={[styles.track, trackStyle]} />
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  track: {
    position: 'absolute',
    right: TRACK_RIGHT + (THUMB_WIDTH - 2) / 2,
    width: 2,
    borderRadius: 1,
    backgroundColor: Palette.muted,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    right: TRACK_RIGHT,
    width: THUMB_WIDTH,
    borderRadius: THUMB_WIDTH / 2,
    backgroundColor: Palette.gold,
  },
});
