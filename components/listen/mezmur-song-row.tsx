import { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MezmurSongOptionsSheet } from '@/components/listen/mezmur-song-options-sheet';
import {
  VIDEO_THUMB_BORDER_RADIUS,
  VIDEO_THUMB_ROW_GAP,
  VIDEO_THUMB_ROW_HEIGHT,
  VIDEO_THUMB_ROW_WIDTH,
  VideoThumbnail,
} from '@/components/listen/video-thumbnail';
import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';
import { useAudioPlayer, type AudioTrack } from '@/contexts/audio-player-context';

type MezmurSongRowProps = {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  /** YouTube id for Add to Playlist (falls back to audioTrack.videoId). */
  videoId?: string;
  onPress: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  /** Trailing control — more menu, bookmark unsave, or close dismiss. */
  removeIcon?: Extract<IconName, 'close' | 'bookmark-filled' | 'more-horizontal'>;
  /** Catalog-style bordered card (See All lists). Default: flat list row. */
  variant?: 'list' | 'catalog';
  /** When set, the row menu can add this track to the playback queue. */
  audioTrack?: AudioTrack;
  /** Show song options menu (play now, add to queue). Default: true when audioTrack is set. */
  showOptions?: boolean;
};

export const MezmurSongRow = memo(function MezmurSongRow({
  title,
  subtitle,
  thumbnailUrl,
  videoId: videoIdProp,
  onPress,
  onRemove,
  removeLabel,
  removeIcon = 'close',
  variant = 'list',
  audioTrack,
  showOptions,
}: MezmurSongRowProps) {
  const { addToQueue } = useAudioPlayer();
  const [menuVisible, setMenuVisible] = useState(false);
  const isCatalog = variant === 'catalog';
  const useOptionsMenu = showOptions ?? Boolean(audioTrack);
  const isMenu = useOptionsMenu || removeIcon === 'more-horizontal';
  const isUnsave = removeIcon === 'bookmark-filled' && !useOptionsMenu;
  const resolvedVideoId = (videoIdProp ?? audioTrack?.videoId ?? '').trim();
  const thumbVideoId = resolvedVideoId || audioTrack?.videoId;

  const openMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleTrailingPress = useCallback(() => {
    if (useOptionsMenu || removeIcon === 'more-horizontal') {
      openMenu();
      return;
    }
    onRemove?.();
  }, [openMenu, onRemove, removeIcon, useOptionsMenu]);

  const handleAddToQueue = useCallback(() => {
    if (!audioTrack) return;
    addToQueue(audioTrack);
  }, [addToQueue, audioTrack]);

  return (
    <>
      <OrthodoxPressable
        style={[styles.row, isCatalog && styles.rowCatalog]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}>
        {thumbnailUrl ? (
          <VideoThumbnail uri={thumbnailUrl} videoId={thumbVideoId} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <ThemedText style={styles.thumbGlyph}>♪</ThemedText>
          </View>
        )}

        <View style={styles.copy}>
          <ThemedText style={[styles.title, isCatalog && styles.titleCatalog]} numberOfLines={2}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        {useOptionsMenu || onRemove ? (
          <OrthodoxPressable
            style={isMenu || isUnsave ? styles.menuBtn : styles.removeBtn}
            onPress={handleTrailingPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={removeLabel ?? 'Song options'}>
            <Icon
              name={isMenu ? 'more-horizontal' : removeIcon}
              size={isMenu ? 20 : isUnsave ? 18 : 12}
              color={isMenu || isUnsave ? Palette.gold : Palette.text}
            />
          </OrthodoxPressable>
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </OrthodoxPressable>

      {useOptionsMenu && audioTrack ? (
        <MezmurSongOptionsSheet
          visible={menuVisible}
          title={title}
          subtitle={subtitle}
          thumbnailUrl={thumbnailUrl}
          videoId={thumbVideoId}
          videoIdForPlaylist={resolvedVideoId}
          onClose={() => setMenuVisible(false)}
          onPlayNow={onPress}
          onAddToQueue={handleAddToQueue}
          onRemove={onRemove}
          removeLabel={removeLabel}
        />
      ) : null}
    </>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 2,
  },
  rowCatalog: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  thumb: {
    width: VIDEO_THUMB_ROW_WIDTH,
    height: VIDEO_THUMB_ROW_HEIGHT,
    marginRight: VIDEO_THUMB_ROW_GAP,
    borderRadius: VIDEO_THUMB_BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: Palette.card,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: {
    color: Palette.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 15,
    color: Palette.text,
    lineHeight: 21,
  },
  titleCatalog: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  chevron: {
    color: Palette.mutedGold,
    fontSize: 22,
    marginLeft: 2,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 10, 8, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
  },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
