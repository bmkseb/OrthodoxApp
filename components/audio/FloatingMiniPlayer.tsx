import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
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
import { useAudioPlayer } from '@/contexts/audio-player-context';

export function FloatingMiniPlayer() {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    progress,
    isMiniPlayerVisible,
    openFullPlayer,
    dismissMiniPlayer,
    playPause,
    previousTrack,
    nextTrack,
  } = useAudioPlayer();

  // The player is clipped to a container that ends at the top of the nav bar, so
  // sliding the pill down makes it disappear exactly at the nav bar's top edge.
  const navBarTop = getTabBarBottom(insets) + FloatingBottom.tabBarHeight;
  const slideOffset = FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap;

  const translateY = useSharedValue(slideOffset);

  // Keep the last track mounted while it slides out so dismissal is animated.
  const [renderTrack, setRenderTrack] = useState(currentTrack);

  useEffect(() => {
    if (currentTrack) {
      setRenderTrack(currentTrack);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (isMiniPlayerVisible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 280, mass: 0.85 });
      return;
    }
    // Slide straight out with no spring tail, then unmount as it leaves.
    translateY.value = withTiming(slideOffset, { duration: 140 }, (finished) => {
      if (finished && !currentTrack) {
        runOnJS(setRenderTrack)(null);
      }
    });
  }, [isMiniPlayerVisible, currentTrack, slideOffset, translateY]);

  const animatedHost = useAnimatedStyle(() => ({
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
          bottom: navBarTop,
          left: FloatingBottom.horizontalMargin,
          right: FloatingBottom.horizontalMargin,
        },
      ]}>
      <Animated.View style={[styles.slider, animatedHost]}>
        <Pressable
          onPress={openFullPlayer}
          style={styles.pill}
          accessibilityRole="button"
          accessibilityLabel="Open full player">
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        {Platform.OS === 'ios' ? (
          <BlurView intensity={56} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.glass} />

        <View style={styles.row}>
          <SacredImage uri={renderTrack.artworkUri} style={styles.artwork} />

          <View style={styles.meta}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {renderTrack.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {renderTrack.artist}
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

          <OrthodoxPressable
            onPress={(e) => {
              e?.stopPropagation?.();
              dismissMiniPlayer();
            }}
            accessibilityLabel="Close player"
            hitSlop={8}
            style={styles.closeBtn}>
            <Icon name="close" size={18} color={Palette.muted} />
          </OrthodoxPressable>
        </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    // Height covers the pill + its gap above the nav bar; bottom is pinned to the
    // nav bar top and overflow is hidden so the pill vanishes at the nav bar's top edge.
    height: FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap,
    overflow: 'hidden',
    zIndex: 80,
    elevation: 80,
  },
  slider: {
    height: FloatingBottom.miniPlayerHeight + FloatingBottom.miniPlayerGap,
    justifyContent: 'flex-start',
  },
  pill: {
    height: FloatingBottom.miniPlayerHeight,
    borderRadius: FloatingBottom.miniPlayerRadius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    // 1px gold hairline at the top edge to visually separate the player from
    // the page beneath it (30% opacity per spec).
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
  closeBtn: {
    padding: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s16,
  },
});
