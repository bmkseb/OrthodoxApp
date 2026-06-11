import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BookshelfBookCard } from '@/components/read/bookshelf-book-card';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { getReadCoverFocus, getReadCoverTone } from '@/constants/read-cover-art';
import { Space } from '@/constants/theme';
import type { CatalogBook } from '@/data/catalogBooks';

type CatalogShelfProps = {
  title: string;
  books: CatalogBook[];
  onSeeAll: () => void;
};

/** A single labeled genre shelf within the Orthodox Catalog preview. */
export function CatalogShelf({ title, books, onSeeAll }: CatalogShelfProps) {
  const router = useRouter();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  return (
    <View style={styles.wrap}>
      <ShelfSubsectionHeader title={title} onSeeAllPress={onSeeAll} />

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
            coverTone={getReadCoverTone(book.id)}
            coverFocus={getReadCoverFocus(book.id)}
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
  hint: {
    marginTop: Space.s8,
  },
});
