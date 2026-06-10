import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSegments } from 'expo-router';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { FloatingBottom, getTabBarBottom } from '@/constants/floating-bottom';
import { Palette, Space, Typography } from '@/constants/theme';
import { useAudioPlayer, usePlayerProgress } from '@/contexts/audio-player-context';
import { useTranslation } from '@/hooks/use-translation';
import { resolvePlayerCopyFromTrack } from '@/lib/audio-track-display';

export function FloatingMiniPlayer() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const onTabs = segments[0] === '(tabs)';
  const { mode } = useTranslation();

  const {
    currentTrack,
    isPlaying,
    isMiniPlayerVisible,
    openFullPlayer,
    dismissMiniPlayer,
    playPause,
    previousTrack,
    nextTrack,
  } = useAudioPlayer();

  const { position, duration } = usePlayerProgress(250);
  const progress = duration > 0 ? position / duration : 0;
  const copy = currentTrack ? resolvePlayerCopyFromTrack(mode, currentTrack) : null;

  const tabBarTop = onTabs
    ? getTabBarBottom(insets) + FloatingBottom.tabBarHeight
    : insets.bottom + Space.s8;
  const playerBottom = tabBarTop + FloatingBottom.miniPlayerGap;
  const slideOffset = FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap;

  const translateY = useSharedValue(slideOffset);
  const [renderTrack, setRenderTrack] = useState(currentTrack);

  useEffect(() => {
    if (currentTrack) setRenderTrack(currentTrack);
  }, [currentTrack]);

  useEffect(() => {
    if (isMiniPlayerVisible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 280, mass: 0.85 });
      return;
    }
    translateY.value = withTiming(slideOffset, { duration: 140 }, (finished) => {
      if (finished && !currentTrack) runOnJS(setRenderTrack)(null);
    });
  }, [isMiniPlayerVisible, currentTrack, slideOffset, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!renderTrack) return null;

  const pct = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View
      pointerEvents={isMiniPlayerVisible && currentTrack ? 'box-none' : 'none'}
      style={[
        styles.clip,
        {
          bottom: playerBottom,
          left: FloatingBottom.horizontalMargin,
          right: FloatingBottom.horizontalMargin,
        },
      ]}>
      <Animated.View style={[styles.slider, animatedStyle]}>
        <View style={styles.pill}>
          <View style={styles.progressTrack} pointerEvents="none">
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>

          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={72}
              tint="dark"
              style={styles.blurFill}
              pointerEvents="none"
            />
          ) : null}
          {Platform.OS === 'ios' ? <View style={styles.glass} pointerEvents="none" /> : null}

          <View style={styles.row}>
            <Pressable
              onPress={openFullPlayer}
              style={styles.tapArea}
              accessibilityRole="button"
              accessibilityLabel="Open full player">
              <SacredImage uri={renderTrack.artworkUri} style={styles.artwork} contentFit="cover" />
              <View style={styles.meta}>
                <ThemedText style={styles.title} numberOfLines={1}>
                  {copy?.title ?? renderTrack.title}
                </ThemedText>
                <ThemedText style={styles.artist} numberOfLines={1}>
                  {copy?.artist ?? renderTrack.artist}
                </ThemedText>
              </View>
            </Pressable>

            <View style={styles.controls} pointerEvents="auto">
              <OrthodoxPressable onPress={previousTrack} accessibilityLabel="Previous track" hitSlop={8}>
                <Icon name="skip-back" size={18} color={Palette.gold} />
              </OrthodoxPressable>
              <OrthodoxPressable
                onPress={playPause}
                accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                hitSlop={12}>
                <Icon name={isPlaying ? 'pause' : 'play'} size={22} color={Palette.gold} />
              </OrthodoxPressable>
              <OrthodoxPressable onPress={nextTrack} accessibilityLabel="Next track" hitSlop={8}>
                <Icon name="skip-forward" size={18} color={Palette.gold} />
              </OrthodoxPressable>
            </View>

            <OrthodoxPressable
              onPress={dismissMiniPlayer}
              accessibilityLabel="Close player"
              hitSlop={8}
              style={styles.closeBtn}>
              <Icon name="close" size={18} color={Palette.muted} />
            </OrthodoxPressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    height: FloatingBottom.miniPlayerHeight,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: 1100,
    elevation: 1100,
  },
  slider: {
    height: FloatingBottom.miniPlayerHeight,
    backgroundColor: 'transparent',
  },
  pill: {
    height: FloatingBottom.miniPlayerHeight,
    borderRadius: FloatingBottom.miniPlayerRadius,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(12, 10, 8, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 147, 58, 0.3)',
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
  blurFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: FloatingBottom.miniPlayerRadius,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 8, 0.74)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Space.s12,
    gap: Space.s8,
    zIndex: 2,
  },
  tapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Space.s8,
    gap: Space.s12,
    minWidth: 0,
  },
  artwork: {
    width: 68,
    height: 38,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.28)',
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
  closeBtn: {
    padding: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s16,
    zIndex: 4,
  },
});
