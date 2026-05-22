import React, { useState } from 'react';
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
import { BorderRadius, Layout, Palette } from '@/constants/theme';

type LanguageTab = 'english' | 'amharic' | 'geez';
const LANGUAGE_TAB_KEYS: LanguageTab[] = ['english', 'amharic', 'geez'];

const OLD_TESTAMENT = ['Genesis', 'Exodus', 'Deuteronomy', 'Leviticus', 'Numbers', 'Joshua', 'Judges'];
const NEW_TESTAMENT = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Galatians'];

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

function ScriptureRow({ label, isLast }: { label: string; isLast: boolean }) {
  return (
    <>
      <OrthodoxPressable style={styles.scriptureRow}>
        <ThemedText style={styles.scriptureText}>{label}</ThemedText>
        <Text style={styles.rowChevron}>›</Text>
      </OrthodoxPressable>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function CollapsibleGroup({ title, items, defaultOpen = false }: { title: string; items: string[]; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <View style={styles.groupWrap}>
      <OrthodoxPressable style={styles.groupHeader} onPress={() => setIsOpen((p) => !p)}>
        <Text style={[styles.groupChevron, { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }]}>›</Text>
        <ThemedText style={styles.groupTitle}>{title}</ThemedText>
      </OrthodoxPressable>
      {isOpen && (
        <View style={styles.stackedCard}>
          {items.map((item, index) => (
            <ScriptureRow key={item} label={item} isLast={index === items.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CatalogScreen() {
  const { t } = useTranslation();
  const [activeLanguage, setActiveLanguage] = useState<LanguageTab>('english');

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
        <SearchBar placeholder={t('catalog.searchPlaceholder')} recentSearches={['Genesis', 'Matthew']} />
      </View>

      <CollapsibleGroup title={t('catalog.oldTestament')} items={OLD_TESTAMENT} defaultOpen />
      <CollapsibleGroup title={t('catalog.newTestament')} items={NEW_TESTAMENT} />
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
  groupWrap: { marginBottom: Layout.sectionGap },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Layout.headerContentGap },
  groupChevron: { color: Palette.gold, fontSize: 18 },
  groupTitle: { fontSize: 18, fontWeight: '600', color: Palette.text },
  stackedCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
    backgroundColor: Palette.card,
    overflow: 'hidden',
  },
  scriptureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  scriptureText: { fontSize: 16, color: Palette.text },
  rowChevron: { color: Palette.muted, fontSize: 18 },
  rowDivider: { height: 1, backgroundColor: Layout.cardBorder, marginHorizontal: 16 },
});
