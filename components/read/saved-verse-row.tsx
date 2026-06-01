import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { SavedReadOptionsSheet } from '@/components/read/saved-read-options-sheet';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';
import type { SavedVerse } from '@/hooks/use-saved-verses';

type SavedVerseRowProps = {
  verse: SavedVerse;
  onPress: () => void;
  onRemove: () => void;
  /** Flat list row on Read tab; bubble card on See All (matches Orthodox Catalog). */
  variant?: 'list' | 'catalog';
};

function formatSavedDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function verseCategory(verse: SavedVerse): string {
  if (verse.note && verse.color) return 'Highlight & note';
  if (verse.note) return 'Note';
  if (verse.color) return 'Highlight';
  return 'Saved';
}

function quotePreview(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117)}…`;
}

export const SavedVerseRow = memo(function SavedVerseRow({
  verse,
  onPress,
  onRemove,
  variant = 'list',
}: SavedVerseRowProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const reference = `${verse.bookTitle} ${verse.chapter}:${verse.verse}`;
  const meta = useMemo(
    () => `${verseCategory(verse)} · ${formatSavedDate(verse.updatedAt)}`,
    [verse]
  );

  const openMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  return (
    <>
      <OrthodoxPressable
        style={[styles.row, variant === 'catalog' && styles.rowCatalog]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={reference}>
        <View style={styles.copy}>
          <ThemedText style={styles.reference} numberOfLines={1}>
            {reference}
          </ThemedText>

          <View
            style={[
              styles.quoteWrap,
              verse.color ? { backgroundColor: verse.color } : null,
            ]}>
            <ThemedText style={styles.quote} numberOfLines={3}>
              {quotePreview(verse.text)}
            </ThemedText>
          </View>

          {verse.note ? (
            <ThemedText type="muted" style={styles.note} numberOfLines={2}>
              {verse.note}
            </ThemedText>
          ) : null}

          <ThemedText type="muted" style={styles.meta} numberOfLines={1}>
            {meta}
          </ThemedText>
        </View>

        <OrthodoxPressable
          style={[styles.menuBtn, variant === 'catalog' && styles.menuBtnCatalog]}
          onPress={openMenu}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Options for ${reference}`}>
          <Icon name="more-horizontal" size={20} color={Palette.gold} />
        </OrthodoxPressable>
      </OrthodoxPressable>

      <SavedReadOptionsSheet
        visible={menuVisible}
        title={reference}
        subtitle={quotePreview(verse.text)}
        placeholderIcon="bookmark"
        removeLabel="Remove Saved Verse"
        onClose={() => setMenuVisible(false)}
        onRemove={onRemove}
      />
    </>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  reference: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.gold,
    letterSpacing: 0.1,
  },
  quoteWrap: {
    borderRadius: 6,
    paddingHorizontal: 4,
    marginHorizontal: -4,
    paddingVertical: 2,
  },
  quote: {
    fontSize: 14,
    lineHeight: 20,
    color: Palette.text,
    fontStyle: 'italic',
  },
  note: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  meta: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  menuBtnCatalog: {
    marginLeft: Spacing.sm,
  },
});
