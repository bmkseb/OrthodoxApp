import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ShelfSubsectionHeader } from '@/components/read/shelf-subsection-header';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { SoftRailCard } from '@/components/ui/soft-rail-card';
import { Space } from '@/constants/theme';
import type { YaredMelodyShelf } from '@/data/yaredMelodiesCatalog';
import { useTranslation } from '@/hooks/use-translation';

type YaredMelodyShelfProps = {
  shelf: YaredMelodyShelf;
  onSeeAll: () => void;
  compactBottom?: boolean;
};

/** One grouped shelf within the Chants catalog preview on Listen. */
export function YaredMelodyShelf({ shelf, onSeeAll, compactBottom = false }: YaredMelodyShelfProps) {
  const router = useRouter();
  const { t, mode } = useTranslation();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  const shelfTitle = t(shelf.titleKey);

  return (
    <View style={[styles.wrap, compactBottom && styles.wrapCompact]}>
      <ShelfSubsectionHeader title={shelfTitle} onSeeAllPress={onSeeAll} />

      <BookshelfSection
        horizontal
        scrollProps={{
          onScroll: scrollHandler,
          onLayout,
          onContentSizeChange,
        }}>
        {shelf.playlists.map((playlist) => (
          <SoftRailCard
            key={playlist.id}
            title={t(playlist.titleKey)}
            subtitle={mode !== 'en' ? playlist.geez : t('listen.yaredMelodySubtitle')}
            onPress={() => router.push(`/listen/melodies/${playlist.id}` as never)}
          />
        ))}
      </BookshelfSection>

      {shelf.playlists.length > 2 ? (
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
  wrapCompact: {
    marginBottom: 0,
  },
  hint: {
    marginTop: Space.s8,
  },
});
