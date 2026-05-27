import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

type GoldProgressSliderProps = {
  progress: number;
  onSeek: (value: number) => void;
};

export function GoldProgressSlider({ progress, onSeek }: GoldProgressSliderProps) {
  const width = useSharedValue(0);
  const dragProgress = useSharedValue(progress);

  React.useEffect(() => {
    dragProgress.value = progress;
  }, [progress, dragProgress]);

  const fillStyle = useAnimatedStyle(() => {
    const w = width.value * Math.min(Math.max(dragProgress.value, 0), 1);
    return { width: w };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const w = width.value * Math.min(Math.max(dragProgress.value, 0), 1);
    return { transform: [{ translateX: w - 5 }] };
  });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (width.value <= 0) return;
      dragProgress.value = Math.min(Math.max(e.x / width.value, 0), 1);
    })
    .onEnd(() => {
      runOnJS(onSeek)(dragProgress.value);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    if (width.value <= 0) return;
    const next = Math.min(Math.max(e.x / width.value, 0), 1);
    dragProgress.value = next;
    runOnJS(onSeek)(next);
  });

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        style={styles.track}
        onLayout={(e) => {
          width.value = e.nativeEvent.layout.width;
        }}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 1.5,
    backgroundColor: 'rgba(201, 147, 58, 0.75)',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.gold,
    borderWidth: 1.5,
    borderColor: Palette.background,
  },
});
