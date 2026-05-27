import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type MediaListItemProps = {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  onPress?: () => void;
};

export function MediaListItem({ title, subtitle, image, onPress }: MediaListItemProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <ImageBackground source={image} style={styles.thumbnail} imageStyle={styles.thumbnailImage} />
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.listItemGap,
    borderLeftWidth: Layout.listAccentBorder,
    borderLeftColor: Palette.gold,
    paddingLeft: Layout.listContentInset,
  },
  thumbnail: {
    width: Layout.thumbnailSize,
    height: Layout.thumbnailSize,
  },
  thumbnailImage: {
    borderRadius: BorderRadius.sm,
  },
  info: {
    marginLeft: Spacing.md - 2,
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.15,
  },
  subtitle: {
    fontSize: 12,
  },
});
