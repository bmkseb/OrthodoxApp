import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { BorderRadius, Layout, Palette, Spacing, Space } from '@/constants/theme';
import {
  makeBookmarkId,
  removeBookmark,
  useBookmarks,
} from '@/hooks/use-bookmarks';
import { removeSavedVerse, useSavedVerses } from '@/hooks/use-saved-verses';
import { scriptureLangQuery } from '@/hooks/use-scripture-lang';
import { useTranslation } from '@/hooks/use-translation';

export default function SavedScreen() {
  const { saved } = useSavedVerses();
  const { bookmarks } = useBookmarks();
  const { mode } = useTranslation();

  const isEmpty = saved.length === 0 && bookmarks.length === 0;

  return (
    <ScreenScrollView>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
          <ThemedText type="seeAll">← Back</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.pageTitle}>Saved & Highlights</ThemedText>
      {mode !== 'en' ? (
        <ThemedText style={styles.pageGeez}>ምልክት የተደረገባቸው</ThemedText>
      ) : null}
      <ThemedText type="muted" style={styles.description}>
        Bookmarked pages, highlighted verses, and your notes.
      </ThemedText>

      {isEmpty ? (
        <EmptyState
          title="Nothing saved yet"
          suggestion="Bookmark a page or tap a verse while reading to highlight it or add a note."
        />
      ) : null}

      {bookmarks.length > 0 ? (
        <>
          <ThemedText style={styles.sectionTitle}>Bookmarked Pages</ThemedText>
          {bookmarks.map((bm) => (
            <TouchableOpacity
              key={makeBookmarkId(bm.bookId, bm.chapter)}
              style={styles.bookmarkRow}
              accessibilityRole="button"
              onPress={() =>
                router.push(
                  `/book/${bm.bookId}/${bm.chapter}${scriptureLangQuery(bm.lang)}`
                )
              }>
              <Icon name="bookmark" size={18} color={Palette.gold} />
              <View style={styles.bookmarkText}>
                <ThemedText style={styles.bookmarkTitle}>{bm.bookTitle}</ThemedText>
                <ThemedText type="muted" style={styles.bookmarkSub}>
                  Chapter {bm.chapter}
                </ThemedText>
              </View>
              <OrthodoxPressable
                hitSlop={10}
                onPress={() => void removeBookmark(makeBookmarkId(bm.bookId, bm.chapter))}
                accessibilityLabel="Remove bookmark"
                style={styles.removeBtn}>
                <Icon name="close" size={15} color={Palette.muted} />
              </OrthodoxPressable>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      {saved.length > 0 ? (
        <ThemedText style={styles.sectionTitle}>Highlights & Notes</ThemedText>
      ) : null}

      {saved.map((item) => (
          <TouchableOpacity
            key={item.verseId}
            style={styles.row}
            accessibilityRole="button"
            onPress={() =>
              router.push(
                `/book/${item.bookId}/${item.chapter}${scriptureLangQuery(item.lang)}`
              )
            }>
            <View style={styles.rowHeader}>
              <View style={styles.refWrap}>
                {item.color ? (
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                ) : null}
                <ThemedText style={styles.reference}>
                  {item.bookTitle} {item.chapter}:{item.verse}
                </ThemedText>
              </View>
              <OrthodoxPressable
                hitSlop={10}
                onPress={() => void removeSavedVerse(item.verseId)}
                accessibilityLabel="Remove"
                style={styles.removeBtn}>
                <Icon name="close" size={15} color={Palette.muted} />
              </OrthodoxPressable>
            </View>

            <View
              style={[styles.verseWrap, item.color ? { backgroundColor: item.color } : null]}>
              <ThemedText style={styles.verseText} numberOfLines={4}>
                {item.text}
              </ThemedText>
            </View>

            {item.note ? (
              <View style={styles.noteRow}>
                <Icon name="bookmark" size={13} color={Palette.gold} />
                <ThemedText style={styles.noteText}>{item.note}</ThemedText>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 18,
    color: Palette.gold,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Layout.sectionGap,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.muted,
    marginTop: Space.s12,
    marginBottom: Space.s12,
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s12,
    padding: Spacing.md,
    marginBottom: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  bookmarkText: {
    flex: 1,
    minWidth: 0,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookmarkSub: {
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    padding: Spacing.md,
    marginBottom: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.s8,
  },
  refWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    flex: 1,
    minWidth: 0,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reference: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.gold,
  },
  removeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseWrap: {
    borderRadius: 6,
    paddingHorizontal: 6,
    marginHorizontal: -6,
    paddingVertical: 2,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: Palette.text,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.s8,
    marginTop: Space.s12,
    paddingTop: Space.s12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(201, 147, 58, 0.18)',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: 'rgba(245, 236, 215, 0.82)',
  },
});
