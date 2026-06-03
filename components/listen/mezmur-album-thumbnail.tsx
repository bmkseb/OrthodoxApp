import { Image, type ImageStyle } from 'expo-image';

import { memo } from 'react';

import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { mezmurAlbumImageSource } from '@/constants/mezmur-album-art';
import { Layout, Palette } from '@/constants/theme';



type MezmurAlbumThumbnailProps = {

  artist?: string;

  album: string;

  thumbnailUrl?: string | null;

  style?: StyleProp<ImageStyle | ViewStyle>;

};



/** Playlist/album thumbnail — 16:9 frame, cover fill (center crop, no side letterboxing). */

export const MezmurAlbumThumbnail = memo(function MezmurAlbumThumbnail({

  artist,

  album,

  thumbnailUrl,

  style,

}: MezmurAlbumThumbnailProps) {

  const source = artist ? mezmurAlbumImageSource(artist, album, thumbnailUrl) : null;

  const remoteUri = !artist && thumbnailUrl ? thumbnailUrl : null;



  if (!source && !remoteUri) {
    return (
      <View style={[styles.placeholder, style]}>
        <Icon name="music" size={28} color={Palette.gold} />
      </View>
    );
  }

  return (
    <Image
      source={source ?? { uri: remoteUri! }}
      style={[styles.image, style]}
      contentFit="cover"
      contentPosition="center"
    />
  );

});



const styles = StyleSheet.create({
  image: {
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

