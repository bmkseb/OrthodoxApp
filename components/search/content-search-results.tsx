import React from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

export type ContentSearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  snippet?: string;
  /** When set (including null), renders a leading thumbnail on the left. */
  imageUri?: string | null;
  /** Header rows (books, topics, chapters) omit the quote snippet. */
  isHeader?: boolean;
  onPress: () => void;
};

type ContentSearchResultsProps = {
  heading: string;
  hits: ContentSearchHit[];
  loading?: boolean;
  emptyLabel?: string;
};

export function ContentSearchResults({
  heading,
  hits,
  loading = false,
  emptyLabel,
}: ContentSearchResultsProps) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={Palette.gold} />
      </View>
    );
  }

  if (hits.length === 0) {
    if (!emptyLabel) return null;
    return (
      <ThemedText type="muted" style={styles.empty}>
        {emptyLabel}
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.heading}>{heading}</ThemedText>
      <View style={styles.list}>
        {hits.map((hit, index) => {
          const showImage = hit.imageUri !== undefined;
          return (
          <View key={hit.id}>
            <OrthodoxPressable
              style={[styles.row, showImage && styles.rowWithImage]}
              onPress={() => {
                Keyboard.dismiss();
                hit.onPress();
              }}
              accessibilityRole="button"
              accessibilityLabel={`${hit.title}. ${hit.isHeader ? hit.subtitle ?? hit.title : hit.snippet ?? hit.title}`}>
              {showImage ? (
                hit.imageUri ? (
                  <Image source={{ uri: hit.imageUri }} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <ThemedText style={styles.thumbGlyph}>{hit.title.charAt(0)}</ThemedText>
                  </View>
                )
              ) : null}
              <View style={styles.copy}>
                <ThemedText style={[styles.title, hit.isHeader && styles.headerTitle]} numberOfLines={1}>
                  {hit.title}
                </ThemedText>
                {hit.subtitle ? (
                  <ThemedText style={styles.subtitle} numberOfLines={1}>
                    {hit.subtitle}
                  </ThemedText>
                ) : null}
                {!hit.isHeader && hit.snippet ? (
                  <ThemedText style={styles.snippet} numberOfLines={3}>
                    {hit.snippet}
                  </ThemedText>
                ) : null}
              </View>
              <ThemedText style={styles.chevron}>›</ThemedText>
            </OrthodoxPressable>
            {index < hits.length - 1 ? (
              <View style={[styles.divider, showImage && styles.dividerWithImage]} />
            ) : null}
          </View>
        );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Layout.sectionHeaderGap },
  heading: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.mutedGold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  list: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    backgroundColor: 'rgba(22, 19, 16, 0.75)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  rowWithImage: {
    alignItems: 'center',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: {
    color: Palette.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  headerTitle: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    color: Palette.gold,
  },
  snippet: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.muted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(201, 147, 58, 0.45)',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
  },
  dividerWithImage: {
    marginLeft: Spacing.md + 44 + Spacing.sm,
  },
  loadingWrap: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
