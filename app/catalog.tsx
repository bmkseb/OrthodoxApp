import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BilingualHeader } from '@/components/ui/bilingual-header';
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
import { scriptureLangQuery } from '@/hooks/use-scripture-lang';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

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
            style={[styles.segmentPill, isActive ? styles.segmentPillActive : styles.segmentPillInactive]}
            onPress={() => onChange(key)}>
            <Text style={[styles.segmentLabel, isActive ? styles.segmentLabelActive : styles.segmentLabelInactive]}>
              {t(`catalog.${key}` as TranslationKey)}
            </Text>
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
      {isOpen && (
        <View style={styles.stackedCard}>
          {rows.map((row, index) => (
            <ScriptureRow
              key={row.bookId}
              label={row.label}
              isLast={index === rows.length - 1}
              onPress={row.onPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CatalogScreen() {
  const { t } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState<LanguageTab>('english');
  const [query, setQuery] = useState('');

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
    <ScreenScrollView>
      <OrthodoxPressable style={styles.topBar} onPress={() => router.back()}>
        <ThemedText type="seeAll">{t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      <View style={styles.pageTitleRow}>
        <Icon name="scroll" size={22} />
        <BilingualHeader headerKey="orthodoxCatalog" variant="page" />
      </View>

      <LanguageTabs activeTab={activeLanguage} onChange={setActiveLanguage} />

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={t('catalog.searchPlaceholder')}
          recentSearches={['Genesis', 'Matthew', 'Enoch']}
          value={query}
          onChangeText={setQuery}
        />
      </View>

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
  pageTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: Layout.sectionGap },
  segmentedRow: { flexDirection: 'row', gap: 8, marginBottom: Layout.sectionGap },
  segmentPill: { flex: 1, borderRadius: BorderRadius.full, paddingVertical: 10, alignItems: 'center' },
  segmentPillActive: { backgroundColor: Palette.gold },
  segmentPillInactive: { backgroundColor: Palette.card },
  segmentLabel: { fontSize: 13, fontWeight: '600' },
  segmentLabelActive: { color: Palette.background },
  segmentLabelInactive: { color: Palette.muted },
  searchWrap: { marginBottom: Layout.sectionGap },
  canonCount: { marginBottom: Layout.headerContentGap },
  groupWrap: { marginBottom: Layout.sectionGap },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Layout.headerContentGap },
  groupChevron: { color: Palette.gold, fontSize: 18 },
  groupTitle: { fontSize: 18, fontWeight: '600', color: Palette.text, flex: 1 },
  stackedCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
    overflow: 'hidden',
  },
  scriptureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  scriptureText: { fontSize: 16, color: Palette.text, flex: 1 },
  rowChevron: { color: Palette.muted, fontSize: 18 },
  rowDivider: { height: 1, backgroundColor: Layout.cardBorder, marginHorizontal: 16 },
});
