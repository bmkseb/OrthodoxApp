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
import { SacredImagery } from '@/constants/sacred-imagery';
import { Palette, Space } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { encodeRouteParam, type MezmurArtist } from '@/lib/mezmur';

type MezmurCatalogShelfProps = {
  title: string;
  artists: MezmurArtist[];
  onSeeAll: () => void;
  /** Drop bottom margin when another section follows immediately. */
  compactBottom?: boolean;
};

/** A single language shelf within the Hymns Catalog preview (mirrors CatalogShelf on Read). */
export function MezmurCatalogShelf({
  title,
  artists,
  onSeeAll,
  compactBottom = false,
}: MezmurCatalogShelfProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { values, scrollHandler, onLayout, onContentSizeChange } = useHorizontalScrollIndicator();

  if (artists.length === 0) return null;

  return (
    <View style={[styles.wrap, compactBottom && styles.wrapCompact]}>
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
        {artists.map((channel) => (
          <SoftRailCard
            key={channel.name}
            title={channel.name}
            subtitle={`${channel.albumCount} playlists · ${channel.songCount} songs`}
            imageUri={channel.thumbnailUrl ?? SacredImagery.listenHymns}
            onPress={() => router.push(`/listen/${encodeRouteParam(channel.name)}` as never)}
          />
        ))}
      </BookshelfSection>

      {artists.length > 2 ? (
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
