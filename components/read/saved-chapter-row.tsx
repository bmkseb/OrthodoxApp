import { Image } from 'expo-image';
import { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { SavedReadOptionsSheet } from '@/components/read/saved-read-options-sheet';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type SavedChapterRowProps = {
  title: string;
  chapter: number;
  thumbnailUrl?: string;
  onPress: () => void;
  onRemove: () => void;
  /** Flat list row on Read tab; bubble card on See All (matches Orthodox Catalog). */
  variant?: 'list' | 'catalog';
};

export const SavedChapterRow = memo(function SavedChapterRow({
  title,
  chapter,
  thumbnailUrl,
  onPress,
  onRemove,
  variant = 'list',
}: SavedChapterRowProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  return (
    <>
      <OrthodoxPressable
        style={[styles.row, variant === 'catalog' && styles.rowCatalog]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, Chapter ${chapter}`}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Icon name="book" size={18} color={Palette.gold} />
          </View>
        )}

        <View style={styles.copy}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
            Chapter {chapter}
          </ThemedText>
        </View>

        <OrthodoxPressable
          style={[styles.menuBtn, variant === 'catalog' && styles.menuBtnCatalog]}
          onPress={openMenu}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Options for ${title}`}>
          <Icon name="more-horizontal" size={20} color={Palette.gold} />
        </OrthodoxPressable>
      </OrthodoxPressable>

      <SavedReadOptionsSheet
        visible={menuVisible}
        title={title}
        subtitle={`Chapter ${chapter}`}
        thumbnailUrl={thumbnailUrl}
        placeholderIcon="book"
        removeLabel="Remove Bookmark"
        onClose={() => setMenuVisible(false)}
        onRemove={onRemove}
      />
    </>
  );
});

const THUMB = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 2,
    gap: Spacing.sm,
  },
  rowCatalog: {
    minHeight: 0,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md + Spacing.xs,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnCatalog: {
    marginLeft: Spacing.sm,
  },
});
