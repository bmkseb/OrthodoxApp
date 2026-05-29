import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoldProgressSlider } from '@/components/audio/gold-progress-slider';
import { PlayerDetailsTabs } from '@/components/audio/player-details-tabs';
import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { FloatingBottom, getMiniPlayerBottom } from '@/constants/floating-bottom';
import { Opacity, Palette, Space } from '@/constants/theme';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { useTranslation } from '@/hooks/use-translation';
import { formatPlaybackTime } from '@/lib/audio-utils';
import { resolvePlayerCopyFromTrack } from '@/lib/audio-track-display';

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 850;
const FLING_VELOCITY = 900;
const COLLAPSE_MS = 220;
const ARTWORK_MAX_WIDTH = 320;
const CALM_SPRING = { damping: 28, stiffness: 170, mass: 1 };

const V = {
  artworkToTitle: Space.s16,
  titleToProgress: Space.s24,
  progressToControls: Space.s24,
  controlsToActions: Space.s24,
  actionsToTabs: Space.s24,
} as const;

function staggerStyle(progress: import('react-native-reanimated').SharedValue<number>, start: number, end: number) {
  'worklet';
  return {
    opacity: interpolate(progress.value, [start, end], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(progress.value, [start, end], [18, 0], Extrapolation.CLAMP),
      },
    ],
  };
}

export function FullScreenPlayer() {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { mode } = useTranslation();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    isFullPlayerOpen,
    expandProgress,
    closeFullPlayer,
    playPause,
    nextTrack,
    previousTrack,
    seekTo,
    skipSeconds,
  } = useAudioPlayer();

  const dragY = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const floatY = useSharedValue(0);
  const isClosing = useRef(false);

  const copy = useMemo(
    () => (currentTrack ? resolvePlayerCopyFromTrack(mode, currentTrack) : null),
    [currentTrack, mode]
  );

  const showCategory =
    copy?.categoryLabel &&
    copy.categoryLabel !== copy.title &&
    !copy.title.includes(copy.categoryLabel);

  const miniLayout = useMemo(() => {
    const miniBottom = getMiniPlayerBottom(insets);
    const miniTop = screenH - miniBottom - FloatingBottom.miniPlayerHeight;
    return { miniTop };
  }, [insets, screenH]);

  const resetDrag = useCallback(() => {
    dragY.value = 0;
    scrollY.value = 0;
  }, [dragY, scrollY]);

  useEffect(() => {
    if (!isFullPlayerOpen) {
      isClosing.current = false;
      resetDrag();
      return;
    }

    isClosing.current = false;
    resetDrag();
    floatY.value = withRepeat(withTiming(-5, { duration: 3200 }), -1, true);
  }, [isFullPlayerOpen, floatY, resetDrag]);

  const finishClose = useCallback(() => {
    isClosing.current = false;
    resetDrag();
    closeFullPlayer();
  }, [closeFullPlayer, resetDrag]);

  const animateClose = useCallback(() => {
    if (isClosing.current || !isFullPlayerOpen) return;
    isClosing.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const timeout = setTimeout(finishClose, COLLAPSE_MS + 80);

    expandProgress.value = withTiming(
      0,
      { duration: COLLAPSE_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          clearTimeout(timeout);
          runOnJS(finishClose)();
        }
      }
    );
    dragY.value = withTiming(0, { duration: COLLAPSE_MS, easing: Easing.in(Easing.cubic) });
  }, [closeFullPlayer, dragY, expandProgress, finishClose, isFullPlayerOpen]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const backdropStyle = useAnimatedStyle(() => {
    const dragFade = interpolate(dragY.value, [0, DISMISS_DISTANCE], [1, 0.35], Extrapolation.CLAMP);
    return {
      opacity: interpolate(expandProgress.value, [0, 1], [0, 0.94], Extrapolation.CLAMP) * dragFade,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    const baseY = interpolate(
      expandProgress.value,
      [0, 1],
      [miniLayout.miniTop - insets.top, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(expandProgress.value, [0, 1], [0.96, 1], Extrapolation.CLAMP);
    return {
      transform: [{ translateY: baseY + dragY.value }, { scale }],
    };
  });

  const artworkStyle = useAnimatedStyle(() => {
    const p = expandProgress.value;
    return {
      opacity: interpolate(p, [0, 0.25], [0, 1], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(p, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
        { translateY: interpolate(p, [0, 1], [24, 0], Extrapolation.CLAMP) + floatY.value },
      ],
    };
  });

  const metaStyle = useAnimatedStyle(() => staggerStyle(expandProgress, 0.3, 0.58));
  const progressStyle = useAnimatedStyle(() => staggerStyle(expandProgress, 0.38, 0.65));
  const controlsStyle = useAnimatedStyle(() => staggerStyle(expandProgress, 0.45, 0.72));
  const actionsStyle = useAnimatedStyle(() => staggerStyle(expandProgress, 0.52, 0.78));
  const tabsStyle = useAnimatedStyle(() => staggerStyle(expandProgress, 0.58, 0.85));

  const scrollGesture = Gesture.Native();

  const panGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(scrollGesture)
    .activeOffsetY(8)
    .failOffsetX([-28, 28])
    .onUpdate((e) => {
      const atTop = scrollY.value <= 1;
      const flingDown = e.velocityY > FLING_VELOCITY && e.translationY > 20;

      if (e.translationY > 0 && (atTop || flingDown || dragY.value > 0)) {
        dragY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      const shouldDismiss =
        e.translationY > DISMISS_DISTANCE ||
        e.velocityY > DISMISS_VELOCITY ||
        (e.velocityY > FLING_VELOCITY && e.translationY > 28);

      if (shouldDismiss) {
        runOnJS(animateClose)();
        return;
      }

      if (dragY.value > 0) {
        dragY.value = withSpring(0, CALM_SPRING);
      }
    });

  if (!isFullPlayerOpen || !currentTrack || !copy) return null;

  const elapsed = progress * duration;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={animateClose}
        accessibilityLabel="Close player">
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none">
          <SacredImage
            uri={currentTrack.artworkUri}
            style={styles.backdropArt}
            contentFit="cover"
          />
          {Platform.OS === 'ios' ? (
            <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.backdropTint} />
        </Animated.View>
      </Pressable>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View
            style={[
              styles.sheetInner,
              {
                paddingTop: insets.top + Space.s8,
                paddingBottom: insets.bottom + Space.s16,
              },
            ]}>
            <View style={styles.topBar}>
              <Text style={styles.nowPlaying}>Now Playing</Text>
              <OrthodoxPressable
                onPress={animateClose}
                accessibilityLabel="Close player"
                hitSlop={14}
                style={styles.dismissBtn}>
                <Icon name="chevron-down" size={22} color={Palette.gold} />
              </OrthodoxPressable>
            </View>

            <GestureDetector gesture={scrollGesture}>
              <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                bounces
                contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.artworkColumn, artworkStyle]}>
                  <View style={styles.artworkGlow} pointerEvents="none" />
                  <View style={styles.artworkFrame}>
                    <SacredImage
                      uri={currentTrack.artworkUri}
                      style={styles.artworkImage}
                      contentFit="cover"
                    />
                  </View>
                </Animated.View>

                <Animated.View style={[styles.block, metaStyle, { marginTop: V.artworkToTitle }]}>
                  <ThemedText style={styles.trackTitle} numberOfLines={2}>
                    {copy.title}
                  </ThemedText>
                  <ThemedText style={styles.trackArtist} numberOfLines={1}>
                    {copy.artist}
                  </ThemedText>
                  {showCategory ? (
                    <Text style={styles.category}>{copy.categoryLabel}</Text>
                  ) : null}
                </Animated.View>

                <Animated.View style={[styles.block, progressStyle, { marginTop: V.titleToProgress }]}>
                  <GoldProgressSlider progress={progress} onSeek={seekTo} />
                  <View style={styles.timeRow}>
                    <Text style={styles.time}>{formatPlaybackTime(elapsed)}</Text>
                    <Text style={styles.time}>{formatPlaybackTime(duration)}</Text>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.controlsRow, controlsStyle, { marginTop: V.progressToControls }]}>
                  <OrthodoxPressable
                    onPress={() => skipSeconds(-15)}
                    style={styles.sideControl}
                    accessibilityLabel="Rewind 15 seconds">
                    <Icon name="rewind" size={20} color={Palette.mutedGold} />
                  </OrthodoxPressable>
                  <OrthodoxPressable
                    onPress={previousTrack}
                    style={styles.sideControl}
                    accessibilityLabel="Previous">
                    <Icon name="skip-back" size={24} color={Palette.gold} />
                  </OrthodoxPressable>
                  <OrthodoxPressable
                    onPress={playPause}
                    style={styles.playMain}
                    accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
                    <Icon name={isPlaying ? 'pause' : 'play'} size={28} color={Palette.background} />
                  </OrthodoxPressable>
                  <OrthodoxPressable onPress={nextTrack} style={styles.sideControl} accessibilityLabel="Next">
                    <Icon name="skip-forward" size={24} color={Palette.gold} />
                  </OrthodoxPressable>
                  <OrthodoxPressable
                    onPress={() => skipSeconds(15)}
                    style={styles.sideControl}
                    accessibilityLabel="Forward 15 seconds">
                    <Icon name="forward" size={20} color={Palette.mutedGold} />
                  </OrthodoxPressable>
                </Animated.View>

                <Animated.View
                  style={[styles.secondaryRow, actionsStyle, { marginTop: V.controlsToActions }]}>
                  <SecondaryAction icon="heart" label="Favorite" />
                  <SecondaryAction icon="share" label="Share" />
                  <SecondaryAction icon="list" label="Queue" />
                  <SecondaryAction icon="bookmark" label="Save" />
                </Animated.View>

                <Animated.View style={[styles.tabsWrap, tabsStyle, { marginTop: V.actionsToTabs }]}>
                  <PlayerDetailsTabs
                    lyrics={`Sacred text for “${copy.title}” — manuscript lyrics and transliteration will appear here.`}
                    about={`${copy.title} · ${copy.artist}\n\nA sacred recording from the Orthodox tradition, offered for prayer and contemplation.`}
                    related="Explore related hymns, sermons, and melodies from the Listen library."
                  />
                </Animated.View>
              </Animated.ScrollView>
            </GestureDetector>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function SecondaryAction({ icon, label }: { icon: Parameters<typeof Icon>[0]['name']; label: string }) {
  return (
    <OrthodoxPressable style={styles.secondaryBtn} accessibilityLabel={label}>
      <Icon name={icon} size={17} color={Palette.gold} />
      <Text style={styles.secondaryLabel}>{label}</Text>
    </OrthodoxPressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backdropArt: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 7, 6, 0.92)',
  },
  sheet: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.background,
    overflow: 'hidden',
  },
  sheetInner: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.s16,
    paddingBottom: Space.s12,
    minHeight: 36,
  },
  nowPlaying: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(201, 147, 58, 0.55)',
  },
  dismissBtn: {
    position: 'absolute',
    right: Space.s16,
    top: 0,
    padding: Space.s4,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Space.s24,
    paddingBottom: Space.s32,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  artworkColumn: {
    width: '100%',
    maxWidth: ARTWORK_MAX_WIDTH,
    alignItems: 'center',
    alignSelf: 'center',
  },
  artworkGlow: {
    position: 'absolute',
    width: '88%',
    aspectRatio: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: Palette.gold,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
      },
      android: { elevation: 8 },
    }),
  },
  artworkFrame: {
    width: '100%',
    maxWidth: ARTWORK_MAX_WIDTH,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorderSubtle})`,
    backgroundColor: Palette.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: { elevation: 12 },
    }),
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  block: {
    width: '100%',
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    textAlign: 'center',
    letterSpacing: -0.35,
    lineHeight: 28,
    marginBottom: Space.s8,
    width: '100%',
  },
  trackArtist: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(201, 147, 58, 0.72)',
    textAlign: 'center',
    marginBottom: Space.s4,
    width: '100%',
  },
  category: {
    fontSize: 10,
    fontWeight: '500',
    color: Palette.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: Space.s4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Space.s8,
    width: '100%',
  },
  time: {
    fontSize: 11,
    color: Palette.muted,
    fontVariant: ['tabular-nums'],
    opacity: 0.85,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s16,
    width: '100%',
  },
  sideControl: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Space.s4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: Palette.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space.s24,
    width: '100%',
  },
  secondaryBtn: {
    alignItems: 'center',
    gap: Space.s4,
    minWidth: 48,
  },
  secondaryLabel: {
    fontSize: 9,
    color: Palette.muted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabsWrap: {
    width: '100%',
  },
});
