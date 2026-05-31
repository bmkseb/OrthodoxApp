import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  type SharedValue,
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

export type ScrollIndicatorValues = {
  scrollY: SharedValue<number>;
  contentHeight: SharedValue<number>;
  layoutHeight: SharedValue<number>;
  active: SharedValue<number>;
};

/**
 * Tracks scroll position and surfaces an animated scroll handler that reveals a
 * right-edge position indicator while the user drags and fades it out shortly
 * after scrolling stops. Pair with {@link ScrollIndicator}.
 */
export function useScrollIndicator() {
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

  const values: ScrollIndicatorValues = { scrollY, contentHeight, layoutHeight, active };

  return { values, scrollHandler };
}

type ScrollIndicatorProps = {
  values: ScrollIndicatorValues;
  /** Space at the top of the viewport the thumb should stay below (e.g. safe-area inset). */
  trackInsetTop?: number;
  /** Space at the bottom of the viewport the thumb should stay above (e.g. nav bar). */
  trackInsetBottom?: number;
};

export function ScrollIndicator({
  values,
  trackInsetTop = 0,
  trackInsetBottom = 0,
}: ScrollIndicatorProps) {
  const { scrollY, contentHeight, layoutHeight, active } = values;

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
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.track, trackStyle]} />
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </View>
  );
}

export type HorizontalScrollIndicatorValues = {
  scrollX: SharedValue<number>;
  contentWidth: SharedValue<number>;
  layoutWidth: SharedValue<number>;
};

/**
 * Tracks horizontal scroll position for a rail and surfaces an animated scroll
 * handler. Pair with {@link HorizontalScrollIndicator} to hint that cards can be
 * swiped sideways.
 */
export function useHorizontalScrollIndicator() {
  const scrollX = useSharedValue(0);
  const contentWidth = useSharedValue(1);
  const layoutWidth = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      contentWidth.value = event.contentSize.width;
      layoutWidth.value = event.layoutMeasurement.width;
    },
  });

  // Capture sizes up front so the indicator is visible before the first scroll.
  const onLayout = (event: LayoutChangeEvent) => {
    layoutWidth.value = event.nativeEvent.layout.width;
  };
  const onContentSizeChange = (width: number) => {
    contentWidth.value = width;
  };

  const values: HorizontalScrollIndicatorValues = { scrollX, contentWidth, layoutWidth };

  return { values, scrollHandler, onLayout, onContentSizeChange };
}

type HorizontalScrollIndicatorProps = {
  values: HorizontalScrollIndicatorValues;
  /** Overall width of the indicator track. */
  trackWidth?: number;
};

export function HorizontalScrollIndicator({
  values,
  trackWidth = 56,
}: HorizontalScrollIndicatorProps) {
  const { scrollX, contentWidth, layoutWidth } = values;

  const trackStyle = useAnimatedStyle(() => {
    const scrollable = contentWidth.value > layoutWidth.value + 1;
    return { opacity: scrollable ? 0.4 : 0 };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const visibleRatio = Math.min(layoutWidth.value / Math.max(contentWidth.value, 1), 1);
    const thumbWidth = Math.max(visibleRatio * trackWidth, 14);
    const maxScroll = Math.max(contentWidth.value - layoutWidth.value, 1);
    const progress = Math.min(Math.max(scrollX.value / maxScroll, 0), 1);
    const translateX = progress * (trackWidth - thumbWidth);

    return {
      width: thumbWidth,
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View style={[styles.hTrack, { width: trackWidth }, trackStyle]} pointerEvents="none">
      <Animated.View style={[styles.hThumb, thumbStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  hTrack: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.muted,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  hThumb: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.gold,
  },
});
