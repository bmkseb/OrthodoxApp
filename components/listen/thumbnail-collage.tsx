import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

const COLLAGE_SLOTS = 4;

type ThumbnailCollageProps = {
  uris: string[];
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

/** 2×2 grid of video thumbnails (Spotify-style playlist art). */
export const ThumbnailCollage = memo(function ThumbnailCollage({
  uris,
  gap = 1,
  style,
}: ThumbnailCollageProps) {
  const slots = useMemo(() => {
    const list = uris.filter(Boolean).slice(0, COLLAGE_SLOTS);
    while (list.length < COLLAGE_SLOTS) list.push('');
    return list;
  }, [uris]);

  const rowStyle = useMemo(() => ({ flex: 1, flexDirection: 'row' as const, gap }), [gap]);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.grid}>
        <View style={rowStyle}>
          <CollageCell uri={slots[0]} />
          <CollageCell uri={slots[1]} />
        </View>
        <View style={rowStyle}>
          <CollageCell uri={slots[2]} />
          <CollageCell uri={slots[3]} />
        </View>
      </View>
    </View>
  );
});

function CollageCell({ uri }: { uri: string }) {
  return (
    <View style={styles.cell}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.cellEmpty} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: Palette.card,
  },
  grid: {
    flex: 1,
    gap: 1,
  },
  cell: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceWarm,
  },
  cellEmpty: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
  },
});
