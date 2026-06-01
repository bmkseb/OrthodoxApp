import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

type GoldProgressSliderProps = {
  progress: number;
  onSeek: (value: number) => void;
};

export function GoldProgressSlider({ progress, onSeek }: GoldProgressSliderProps) {
  const trackWidthRef = useRef(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);

  const clamp = useCallback((value: number) => Math.min(Math.max(value, 0), 1), []);

  const progressFromX = useCallback(
    (x: number) => {
      const width = trackWidthRef.current;
      if (width <= 0) return 0;
      return clamp(x / width);
    },
    [clamp]
  );

  const beginScrub = useCallback(
    (x: number) => {
      setScrubbing(true);
      setScrubProgress(progressFromX(x));
    },
    [progressFromX]
  );

  const updateScrub = useCallback(
    (x: number) => {
      setScrubProgress(progressFromX(x));
    },
    [progressFromX]
  );

  const endScrub = useCallback(
    (x: number) => {
      const next = progressFromX(x);
      setScrubProgress(next);
      setScrubbing(false);
      onSeek(next);
    },
    [onSeek, progressFromX]
  );

  const pan = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(beginScrub)(e.x);
    })
    .onUpdate((e) => {
      runOnJS(updateScrub)(e.x);
    })
    .onEnd((e) => {
      runOnJS(endScrub)(e.x);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    runOnJS(endScrub)(e.x);
  });

  const shown = scrubbing ? scrubProgress : progress;
  const pct = clamp(shown) * 100;

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        style={styles.hitArea}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: '100%',
    paddingVertical: 12,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Palette.gold,
  },
});
