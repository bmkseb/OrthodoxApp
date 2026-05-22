import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type MiniPlayerProps = {
  title: string;
  artist: string;
  artworkUri: string;
  progress?: number;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
};

export function MiniPlayer({
  title,
  artist,
  artworkUri,
  progress = 0,
  isPlaying = false,
  onPlayPause,
  onSkipBack,
  onSkipForward,
}: MiniPlayerProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={[styles.container, { bottom: tabBarHeight }]}>
      <View style={styles.divider} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
      </View>

      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.glass} />

      <View style={styles.content}>
        <SacredImage source={{ uri: artworkUri }} style={styles.artwork} />

        <View style={styles.meta}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
          <ThemedText style={styles.artist} numberOfLines={1}>
            {artist}
          </ThemedText>
        </View>

        <View style={styles.controls}>
          <OrthodoxPressable onPress={onSkipBack} accessibilityLabel="Previous track">
            <Icon name="skip-back" size={20} />
          </OrthodoxPressable>
          <OrthodoxPressable onPress={onPlayPause} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={22} />
          </OrthodoxPressable>
          <OrthodoxPressable onPress={onSkipForward} accessibilityLabel="Next track">
            <Icon name="skip-forward" size={20} />
          </OrthodoxPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: Layout.miniPlayerHeight,
    overflow: 'hidden',
    zIndex: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.glass,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.pagePadding,
    gap: Spacing.md,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 13,
    color: Palette.mutedGold,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
