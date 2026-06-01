import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BookshelfBookCard } from '@/components/read/bookshelf-book-card';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ThemedText } from '@/components/themed-text';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { CatalogBook } from '@/data/catalogBooks';

type CatalogShelfProps = {
  title: string;
  books: CatalogBook[];
  onSeeAll: () => void;
};

/** A single labeled genre shelf within the Orthodox Catalog preview. */
export function CatalogShelf({ title, books, onSeeAll }: CatalogShelfProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accent} />
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}>
          <ThemedText type="seeAll" style={styles.seeAll}>
            {t('common.seeAll')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <BookshelfSection
        horizontal
        scrollProps={{
          onScroll: scrollHandler,
          onLayout,
          onContentSizeChange,
        }}>
        {books.map((book) => (
          <BookshelfBookCard
            key={book.id}
            title={book.title}
            subtitle={book.subtitle}
            imageUri={book.image}
            onPress={() => router.push(book.route)}
          />
        ))}
      </BookshelfSection>

      <View style={styles.hint}>
        <HorizontalScrollIndicator values={values} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Space.s16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.s8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  accent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Palette.gold,
    marginRight: Space.s8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Palette.text,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
  },
  hint: {
    marginTop: Space.s8,
  },
});
