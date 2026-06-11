import { StyleSheet, View } from 'react-native';

import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import { SoftRailCard } from '@/components/ui/soft-rail-card';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { Space } from '@/constants/theme';
import type { LearnShelfLesson } from '@/lib/learn-catalog-shelves';

type LearnCatalogShelfProps = {
  title: string;
  items: LearnShelfLesson[];
  onSeeAll?: () => void;
  onLessonPress: (lesson: LearnShelfLesson) => void;
};

/** Labeled doctrine shelf within the Catechism Catalog preview. */
export function LearnCatalogShelf({
  title,
  items,
  onSeeAll,
  onLessonPress,
}: LearnCatalogShelfProps) {
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  if (items.length === 0) return null;

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
        {items.map((item) => (
          <SoftRailCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => onLessonPress(item)}
          />
        ))}
      </BookshelfSection>

      {items.length > 2 ? (
        <View style={styles.hint}>
          <HorizontalScrollIndicator values={values} />
        </View>
      ) : null}
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
