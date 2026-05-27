import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

export const MINI_PLAYER_HEIGHT = Layout.miniPlayerHeight;

type MiniPlayerProps = {
  title: string;
  artist: string;
  artworkUri: string;
  progress?: number;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  style?: StyleProp<ViewStyle>;
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
  style,
}: MiniPlayerProps) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={[styles.container, style]} pointerEvents="auto">
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
        <View style={[styles.progressGlow, { left: `${pct}%` }]} />
      </View>

      {Platform.OS === 'ios' ? (
        <BlurView intensity={88} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.glass} />

      <View style={styles.content}>
        <SacredImage uri={artworkUri} style={styles.artwork} />

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
            <Icon name="skip-back" size={17} />
          </OrthodoxPressable>
          <OrthodoxPressable onPress={onPlayPause} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={22} />
          </OrthodoxPressable>
          <OrthodoxPressable onPress={onSkipForward} accessibilityLabel="Next track">
            <Icon name="skip-forward" size={17} />
          </OrthodoxPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(201, 147, 58, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.gold,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 6,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: Palette.gold,
    shadowColor: Palette.gold,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 12, 10, 0.78)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.pagePadding,
    gap: Spacing.md - 2,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.22)',
  },
  meta: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.text,
    marginBottom: 1,
    letterSpacing: -0.1,
  },
  artist: {
    fontSize: 11,
    fontWeight: '400',
    color: Palette.mutedGold,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
