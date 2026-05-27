import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { FloatingBottom, getMiniPlayerBottom } from '@/constants/floating-bottom';
import { Palette, Space, Typography } from '@/constants/theme';
import { useAudioPlayer } from '@/contexts/audio-player-context';

const SLIDE_OFFSET = FloatingBottom.miniPlayerHeight + 24;

export function FloatingMiniPlayer() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    progress,
    isMiniPlayerVisible,
    expandProgress,
    openFullPlayer,
    playPause,
    previousTrack,
    nextTrack,
  } = useAudioPlayer();
  const translateY = useSharedValue(SLIDE_OFFSET);

  useEffect(() => {
    translateY.value = withSpring(isMiniPlayerVisible ? 0 : SLIDE_OFFSET, {
      damping: 22,
      stiffness: 280,
      mass: 0.85,
    });
  }, [isMiniPlayerVisible, translateY]);

  const animatedHost = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(expandProgress.value, [0, 0.2], [1, 0], Extrapolation.CLAMP),
  }));

  if (!currentTrack) return null;

  const pct = Math.min(Math.max(progress, 0), 1) * 100;
  const bottom = getMiniPlayerBottom(insets);

  return (
    <Animated.View
      pointerEvents={isMiniPlayerVisible ? 'box-none' : 'none'}
      style={[
        styles.host,
        { bottom, left: FloatingBottom.horizontalMargin, right: FloatingBottom.horizontalMargin },
        animatedHost,
      ]}>
      <Pressable onPress={openFullPlayer} style={styles.pill} accessibilityRole="button">
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        {Platform.OS === 'ios' ? (
          <BlurView intensity={56} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.glass} />

        <View style={styles.row}>
          <SacredImage uri={currentTrack.artworkUri} style={styles.artwork} />

          <View style={styles.meta}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </ThemedText>
          </View>

          <View style={styles.controls} onStartShouldSetResponder={() => true}>
            <OrthodoxPressable
              onPress={previousTrack}
              accessibilityLabel="Previous track"
              hitSlop={8}>
              <Icon name="skip-back" size={18} color={Palette.gold} />
            </OrthodoxPressable>
            <OrthodoxPressable
              onPress={playPause}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              hitSlop={8}>
              <Icon name={isPlaying ? 'pause' : 'play'} size={22} color={Palette.gold} />
            </OrthodoxPressable>
            <OrthodoxPressable onPress={nextTrack} accessibilityLabel="Next track" hitSlop={8}>
              <Icon name="skip-forward" size={18} color={Palette.gold} />
            </OrthodoxPressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
  },
  pill: {
    height: FloatingBottom.miniPlayerHeight,
    borderRadius: FloatingBottom.miniPlayerRadius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  progressTrack: {
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 8, 0.88)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.s12,
    gap: Space.s12,
    zIndex: 2,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  meta: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 18,
  },
  artist: {
    fontSize: 12,
    fontWeight: '400',
    color: Palette.muted,
    lineHeight: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s16,
  },
});
