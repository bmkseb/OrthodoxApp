import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ThemedText } from '@/components/themed-text';
import {
  HorizontalScrollIndicator,
  useHorizontalScrollIndicator,
} from '@/components/ui/scroll-indicator';
import { SoftRailCard } from '@/components/ui/soft-rail-card';
import { Palette, Space } from '@/constants/theme';
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

  return (
    <View style={[styles.wrap, compactBottom && styles.wrapCompact]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accent} />
          <ThemedText style={styles.title}>{t(shelf.titleKey)}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${t(shelf.titleKey)}`}>
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
