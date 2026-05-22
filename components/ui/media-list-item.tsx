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
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText type="muted">{subtitle}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.sectionGap,
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
    marginLeft: Spacing.md,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
