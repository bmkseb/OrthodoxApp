import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ContentSearchResults } from '@/components/search/content-search-results';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SearchBar } from '@/components/ui/search-bar';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import {
  BIBLE_CANON_81,
  getBookTitle,
  NEW_TESTAMENT_BOOKS,
  OLD_TESTAMENT_BOOKS,
  type BibleBook,
} from '@/data/bibleCanon';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { scriptureChapterRoute, scriptureLangQuery } from '@/hooks/use-scripture-lang';
import { searchVerses } from '@/lib/scripture';
import { Layout, Palette, Spacing } from '@/constants/theme';

type LanguageTab = 'english' | 'amharic' | 'geez';
const LANGUAGE_TAB_KEYS: LanguageTab[] = ['english', 'amharic', 'geez'];

function LanguageTabs({ activeTab, onChange }: { activeTab: LanguageTab; onChange: (t: LanguageTab) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.segmentedRow}>
      {LANGUAGE_TAB_KEYS.map((key) => {
        const isActive = activeTab === key;
        return (
          <OrthodoxPressable
            key={key}
            style={styles.segmentTab}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>
              {t(`catalog.${key}` as TranslationKey)}
            </Text>
            {isActive ? <View style={styles.segmentIndicator} /> : null}
          </OrthodoxPressable>
        );
      })}
    </View>
  );
}

type BookRow = { bookId: string; label: string; onPress: () => void };

function ScriptureRow({
  label,
  isLast,
  onPress,
}: {
  label: string;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <>
      <OrthodoxPressable style={styles.scriptureRow} onPress={onPress}>
        <ThemedText style={styles.scriptureText}>{label}</ThemedText>
        <Text style={styles.rowChevron}>›</Text>
      </OrthodoxPressable>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function CollapsibleGroup({
  title,
  rows,
  defaultOpen = false,
}: {
  title: string;
  rows: BookRow[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (rows.length === 0) return null;

  return (
    <View style={styles.groupWrap}>
      <OrthodoxPressable style={styles.groupHeader} onPress={() => setIsOpen((p) => !p)}>
        <Text style={[styles.groupChevron, { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }]}>›</Text>
        <ThemedText style={styles.groupTitle}>{title}</ThemedText>
      </OrthodoxPressable>
      {isOpen ? (
        <View style={styles.bookList}>
          {rows.map((row, index) => (
            <ScriptureRow
              key={row.bookId}
              label={row.label}
              isLast={index === rows.length - 1}
              onPress={row.onPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function CatalogScreen() {
  const { t } = useTranslation();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [activeLanguage, setActiveLanguage] = useState<LanguageTab>('english');
  const [query, setQuery] = useState('');
  const { recentSearches, addRecentSearch } = useRecentSearches('catalog');
  const [verseHits, setVerseHits] = useState<Awaited<ReturnType<typeof searchVerses>>>([]);
  const [verseSearchLoading, setVerseSearchLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  useEffect(() => {
    if (typeof q === 'string' && q.trim()) setQuery(q);
  }, [q]);

  useEffect(() => {
    if (!debouncedQuery) {
      setVerseHits([]);
      setVerseSearchLoading(false);
      return;
    }

    let active = true;
    setVerseSearchLoading(true);
    searchVerses(debouncedQuery, activeLanguage)
      .then((hits) => {
        if (active) setVerseHits(hits);
      })
      .catch(() => {
        if (active) setVerseHits([]);
      })
      .finally(() => {
        if (active) setVerseSearchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, activeLanguage]);

  const handleSearchSubmit = (term: string) => {
    setQuery(term);
    void addRecentSearch(term);
  };

  const filteredIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set(BIBLE_CANON_81.map((b) => b.book_id));
    return new Set(
      BIBLE_CANON_81.filter(
        (b) =>
          b.title_english.toLowerCase().includes(q) ||
          b.title_vernacular.includes(query.trim()) ||
          b.title_geez.includes(query.trim()),
      ).map((b) => b.book_id),
    );
  }, [query]);

  const langQ = scriptureLangQuery(activeLanguage);

  const toRow = (b: BibleBook): BookRow => ({
    bookId: b.book_id,
    label: getBookTitle(b, activeLanguage),
    onPress: () => router.push(`/book/${b.book_id}${langQ}`),
  });

  // Same display_order as English: flat OT / NT lists (sorted in bibleCanon.ts)
  const oldTestament = OLD_TESTAMENT_BOOKS.filter((b) => filteredIds.has(b.book_id)).map(toRow);
  const newTestament = NEW_TESTAMENT_BOOKS.filter((b) => filteredIds.has(b.book_id)).map(toRow);

  const otTitle =
    activeLanguage === 'geez'
      ? `${t('catalog.oldTestamentGeez')} (${OLD_TESTAMENT_BOOKS.length})`
      : `${t('catalog.oldTestament')} (${OLD_TESTAMENT_BOOKS.length})`;

  const ntTitle =
    activeLanguage === 'geez'
      ? `${t('catalog.newTestamentGeez')} (${NEW_TESTAMENT_BOOKS.length})`
      : `${t('catalog.newTestament')} (${NEW_TESTAMENT_BOOKS.length})`;

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <OrthodoxPressable style={styles.topBar} onPress={() => router.back()}>
        <ThemedText type="seeAll">{t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      <ScriptureBookHeader title="Holy Bible" subtitle="መጽሐፍ ቅዱስ" />

      <LanguageTabs activeTab={activeLanguage} onChange={setActiveLanguage} />

      <View style={styles.searchSection}>
        <SearchBar
          placeholder={t('catalog.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          onSearchSubmit={handleSearchSubmit}
          recentSearches={recentSearches}
        />
      </View>

      {debouncedQuery ? (
        <ContentSearchResults
          heading="In Scripture"
          hits={verseHits.map((hit) => ({
            id: `${hit.bookId}-${hit.chapter}-${hit.verse}`,
            title: hit.reference,
            snippet: hit.snippet,
            onPress: () => router.push(scriptureChapterRoute(hit.bookId, hit.chapter, activeLanguage, hit.verse)),
          }))}
          loading={verseSearchLoading}
          emptyLabel={!verseSearchLoading ? 'No verses found for this search.' : undefined}
        />
      ) : null}

      <ThemedText type="muted" style={styles.canonCount}>
        {BIBLE_CANON_81.length} {t('catalog.booksInCanon')}
      </ThemedText>

      <CollapsibleGroup title={otTitle} rows={oldTestament} defaultOpen />
      <CollapsibleGroup title={ntTitle} rows={newTestament} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: { marginBottom: Layout.headerContentGap },
  segmentedRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Layout.cardBorder,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 10,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.muted,
  },
  segmentLabelActive: {
    color: Palette.text,
    fontWeight: '600',
  },
  segmentIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '18%',
    right: '18%',
    height: 2,
    borderRadius: 1,
    backgroundColor: Palette.gold,
  },
  searchSection: {
    marginBottom: Layout.sectionGap,
  },
  canonCount: { marginBottom: Layout.headerContentGap },
  groupWrap: { marginBottom: Spacing.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  groupChevron: { color: Palette.mutedGold, fontSize: 16, width: 14 },
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.mutedGold,
    flex: 1,
    lineHeight: 20,
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  bookList: {
    marginTop: 2,
  },
  scriptureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 2,
    gap: 8,
  },
  scriptureText: {
    fontSize: 15,
    color: Palette.text,
    flex: 1,
    flexShrink: 1,
    lineHeight: 21,
  },
  rowChevron: { color: Palette.muted, fontSize: 16 },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
  },
});
