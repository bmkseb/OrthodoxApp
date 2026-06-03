import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThumbnailCollage } from '@/components/listen/thumbnail-collage';
import type { UserPlaylist } from '@/hooks/use-user-playlists';
import {
  userPlaylistCollageUris,
  userPlaylistCoverUri,
} from '@/lib/user-playlists';
import { Layout, Palette } from '@/constants/theme';

type UserPlaylistThumbnailProps = {
  playlist: UserPlaylist;
  style?: StyleProp<ViewStyle>;
  placeholderIconSize?: number;
};

/** Custom cover, else 2×2 YouTube thumbnail collage, else music-note placeholder. */
export const UserPlaylistThumbnail = memo(function UserPlaylistThumbnail({
  playlist,
  style,
  placeholderIconSize = 28,
}: UserPlaylistThumbnailProps) {
  const coverUri = userPlaylistCoverUri(playlist);
  const collageUris = userPlaylistCollageUris(playlist);

  if (coverUri) {
    return (
      <Image
        source={{ uri: coverUri }}
        style={[styles.fill, style]}
        contentFit="cover"
        contentPosition="center"
      />
    );
  }

  if (collageUris.length > 0) {
    return <ThumbnailCollage uris={collageUris} style={style} />;
  }

  return (
    <View style={[styles.placeholder, style]}>
      <Icon name="music" size={placeholderIconSize} color={Palette.gold} />
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
  },
});
