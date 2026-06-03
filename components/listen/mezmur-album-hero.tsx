import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MezmurAlbumThumbnail } from '@/components/listen/mezmur-album-thumbnail';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { UserAvatarBadge } from '@/components/ui/user-avatar-badge';
import { resolveMezmurChannelThumbnail } from '@/constants/mezmur-channel-art';
import { MEZMUR_ALBUM_HERO_FRAME } from '@/constants/mezmur-album-art';
import { Palette, Space, Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { encodeRouteParam } from '@/lib/mezmur';

type MezmurAlbumHeroProps = {
  artist: string;
  album: string;
  songCount: number;
  thumbnailUrl?: string | null;
  /** Override channel row navigation (e.g. user playlists → /listen). */
  channelHref?: string;
  /** Playlist settings (rename, cover, delete). */
  onMenuPress?: () => void;
  /** Show profile initial badge instead of channel image (user playlists). */
  useProfileChannel?: boolean;
};

function formatSongCount(songCount: number): string {
  return `${songCount} ${songCount === 1 ? 'song' : 'songs'}`;
}

/** Album header with back control, cover art, metadata, and play. */
export const MezmurAlbumHero = memo(function MezmurAlbumHero({
  artist,
  album,
  songCount,
  thumbnailUrl,
  channelHref,
  onMenuPress,
  useProfileChannel = false,
}: MezmurAlbumHeroProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const stackCopy = width < 360;

  const artistAvatar = useMemo(
    () =>
      useProfileChannel ? null : resolveMezmurChannelThumbnail(artist, thumbnailUrl ?? null),
    [artist, thumbnailUrl, useProfileChannel]
  );

  const metaLine = formatSongCount(songCount);

  return (
    <View style={styles.wrap}>
      <OrthodoxPressable
        style={styles.backBtn}
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.push('/(tabs)/listen');
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('settings.back')}>
        <Icon name="chevron-left" size={22} color={Palette.text} />
      </OrthodoxPressable>

      <View style={[styles.main, stackCopy && styles.mainStacked]}>
        <View
          style={[
            styles.artFrame,
            stackCopy ? styles.artFrameStacked : styles.artFrameRow,
          ]}>
          <MezmurAlbumThumbnail
            artist={artist}
            album={album}
            thumbnailUrl={thumbnailUrl}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={[styles.copy, stackCopy && styles.copyStacked]}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.kindLabel}>Album</ThemedText>
            {onMenuPress ? (
              <OrthodoxPressable
                style={styles.menuBtn}
                onPress={onMenuPress}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('listen.managePlaylist')}>
                <Icon name="settings" size={20} color={Palette.mutedGold} />
              </OrthodoxPressable>
            ) : null}
          </View>
          <ThemedText style={styles.albumTitle} numberOfLines={3}>
            {album}
          </ThemedText>

          <OrthodoxPressable
            style={styles.artistRow}
            onPress={() =>
              router.push((channelHref ?? `/listen/${encodeRouteParam(artist)}`) as never)
            }
            accessibilityRole="button"
            accessibilityLabel={useProfileChannel ? artist : `Channel ${artist}`}>
            {useProfileChannel ? (
              <UserAvatarBadge size={22} />
            ) : artistAvatar ? (
              <Image source={{ uri: artistAvatar }} style={styles.artistAvatar} contentFit="cover" />
            ) : (
              <View style={[styles.artistAvatar, styles.artistAvatarPlaceholder]}>
                <Icon name="music" size={12} color={Palette.gold} />
              </View>
            )}
            <ThemedText style={styles.artistName} numberOfLines={1}>
              {artist}
            </ThemedText>
          </OrthodoxPressable>

          {metaLine ? (
            <ThemedText type="muted" style={styles.meta}>
              {metaLine}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.s12,
    marginLeft: -4,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Space.s12,
  },
  mainStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  artFrame: {
    borderRadius: MEZMUR_ALBUM_HERO_FRAME.borderRadius,
    overflow: 'hidden',
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  artFrameRow: {
    width: MEZMUR_ALBUM_HERO_FRAME.width,
    minHeight: MEZMUR_ALBUM_HERO_FRAME.height,
    alignSelf: 'stretch',
  },
  artFrameStacked: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
    aspectRatio: 4 / 3,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s8,
  },
  menuBtn: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyStacked: {
    width: '100%',
  },
  kindLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Palette.muted,
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    color: Palette.text,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    marginTop: Space.s4,
    alignSelf: 'flex-start',
  },
  artistAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.card,
  },
  artistAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
  },
  artistName: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text,
    flexShrink: 1,
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
  },
});
