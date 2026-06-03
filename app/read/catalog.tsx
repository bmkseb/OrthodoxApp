import { router, useLocalSearchParams } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { CatalogBookRow } from '@/components/read/catalog-book-row';
import { CatalogListDivider } from '@/components/ui/catalog-list-divider';
import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import { CATALOG_SHELVES, shelfForGenre, type CatalogBook } from '@/data/catalogBooks';
import { useTranslation } from '@/hooks/use-translation';

/** Ordered subsections within a shelf, preserving book order. */
function groupBooks(books: CatalogBook[]): { group: string | null; books: CatalogBook[] }[] {
  const order: (string | null)[] = [];
  const buckets = new Map<string | null, CatalogBook[]>();
  for (const book of books) {
    const key = book.group ?? null;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(book);
  }
  return order.map((group) => ({ group, books: buckets.get(group)! }));
}

export default function CatalogScreen() {
  const { t, mode } = useTranslation();
  const { genre } = useLocalSearchParams<{ genre?: string }>();
  const shelf = shelfForGenre(genre);
  const groups = groupBooks(shelf.books);

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <AppBackButton
        style={styles.topBar}
        onFallback={() => router.push('/(tabs)/read')}
      />

      <ThemedText style={styles.eyebrow}>Orthodox Catalog</ThemedText>
      <ThemedText style={styles.pageTitle}>{shelf.title}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>{shelf.geez}</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        {shelf.description}
      </ThemedText>

      <View style={styles.switcher}>
        {CATALOG_SHELVES.map((option) => {
          const active = option.genre === shelf.genre;
          return (
            <OrthodoxPressable
              key={option.genre}
              style={[styles.switchTab, active && styles.switchTabActive]}
              onPress={() => router.setParams({ genre: option.genre })}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <ThemedText style={[styles.switchLabel, active && styles.switchLabelActive]}>
                {option.title}
              </ThemedText>
            </OrthodoxPressable>
          );
        })}
      </View>

      {groups.map(({ group, books }, index) => (
        <Fragment key={group ?? `g-${index}`}>
          {group ? (
            <ThemedText style={[styles.groupLabel, index > 0 && styles.groupLabelSpaced]}>
              {group}
            </ThemedText>
          ) : null}
          {books.map((book, bookIndex) => (
            <View key={book.id}>
              <CatalogBookRow
                title={book.title}
                subtitle={book.subtitle}
                geez={book.geez}
                showGeez={mode !== 'en'}
                icon={book.icon}
                onPress={() => router.push(book.route)}
              />
              {bookIndex < books.length - 1 ? <CatalogListDivider /> : null}
            </View>
          ))}
        </Fragment>
      ))}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 17,
    color: Palette.gold,
    marginBottom: 4,
  },
  description: {
    marginBottom: Spacing.md,
    lineHeight: 21,
  },
  switcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  switchTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.3)',
  },
  switchTabActive: {
    backgroundColor: 'rgba(201, 147, 58, 0.16)',
    borderColor: Palette.gold,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.muted,
  },
  switchLabelActive: {
    color: Palette.text,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: Spacing.sm,
  },
  groupLabelSpaced: {
    marginTop: Spacing.md,
  },
});
