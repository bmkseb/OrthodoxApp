import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { LearnHeroCard } from '@/components/sacred/learn-hero-card';
import { SoftSeparator } from '@/components/sacred/soft-separator';
import { ThemedText } from '@/components/themed-text';
import { BilingualHeader } from '@/components/ui/bilingual-header';
import { SearchBar } from '@/components/ui/search-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { SettingsNavButton } from '@/components/ui/settings-nav-button';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

const { width } = Dimensions.get('window');

const PILLAR_KEYS = ['trinity', 'incarnation', 'baptism', 'communion', 'resurrection'] as const;
const SACRAMENT_KEYS = [
  'baptismSacrament',
  'chrismation',
  'holyCommunion',
  'penance',
  'matrimony',
  'holyOrders',
  'anointingSick',
] as const;

function FadedRowSeparator() {
  return (
    <View style={styles.separatorWrap}>
      <LinearGradient
        colors={['transparent', 'rgba(201, 147, 58, 0.1)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.separatorLine}
      />
    </View>
  );
}

function LearnListRow({ label, isLast }: { label: string; isLast: boolean }) {
  const { typography, ethiopicStyle, mode } = useTranslation();
  return (
    <>
      <OrthodoxPressable style={styles.listRow}>
        <ThemedText style={[styles.listRowText, typography.body, mode === 'am' ? ethiopicStyle : undefined]}>
          {label}
        </ThemedText>
        <Text style={styles.chevron}>›</Text>
      </OrthodoxPressable>
      {!isLast ? <FadedRowSeparator /> : null}
    </>
  );
}

function TopicSection({
  sectionKey,
  icon,
  itemKeys,
}: {
  sectionKey: 'fivePillars' | 'sevenSacraments';
  icon: 'pillar' | 'scroll';
  itemKeys: readonly string[];
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.topicSection}>
      <OrthodoxPressable style={styles.topicHeader}>
        <View style={styles.topicTitleRow}>
          <Icon name={icon} size={18} />
          <BilingualHeader headerKey={`learn.${sectionKey}`} variant="section" />
        </View>
        <Text style={styles.topicChevron}>›</Text>
      </OrthodoxPressable>
      <View style={styles.stackedCard}>
        <LinearGradient
          colors={['#1C1814', '#161412', '#12100E']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardGrain} pointerEvents="none" />
        {itemKeys.map((key, index) => (
          <LearnListRow
            key={key}
            label={t(`learn.${key}` as TranslationKey)}
            isLast={index === itemKeys.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

export default function LearnScreen() {
  const { t } = useTranslation();
  const featuredWidth = width - Layout.pagePadding * 2;

  return (
    <ScreenScrollView>
      <View style={styles.pageHeader}>
        <View style={styles.pageTitleRow}>
          <Icon name="brain" size={22} />
          <BilingualHeader headerKey="learn" variant="page" />
        </View>
        <SettingsNavButton />
      </View>
      <ThemedText type="muted" style={styles.pageSubtitle}>
        {t('learn.theology')}
      </ThemedText>

      <View style={styles.searchWrap}>
        <SearchBar placeholder={t('common.searchTopics')} recentSearches={['Trinity', 'Sacraments']} />
      </View>

      <LearnHeroCard
        title={t('learn.mysteryTrinity')}
        subtitle={t('learn.fiveMysteries')}
        imageUri="https://picsum.photos/900/520?random=40"
        style={{ width: featuredWidth, marginBottom: Layout.sectionGap }}
      />

      <SoftSeparator />

      <TopicSection sectionKey="fivePillars" icon="pillar" itemKeys={PILLAR_KEYS} />
      <TopicSection sectionKey="sevenSacraments" icon="scroll" itemKeys={SACRAMENT_KEYS} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.titleSubtitleGap,
  },
  pageTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, flex: 1 },
  pageSubtitle: { marginBottom: Layout.sectionGap, marginLeft: 34 },
  searchWrap: { marginBottom: Layout.sectionGap },
  topicSection: { marginBottom: Layout.sectionGap + 4 },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Layout.headerContentGap + 4,
  },
  topicTitleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  topicChevron: { color: 'rgba(201, 147, 58, 0.55)', fontSize: 20, fontWeight: '300' },
  stackedCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.14)',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  cardGrain: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(245, 236, 215, 0.012)' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 58,
    zIndex: 1,
  },
  listRowText: { flex: 1, paddingRight: 12, color: Palette.text },
  chevron: { color: 'rgba(138, 128, 112, 0.85)', fontSize: 16, fontWeight: '300' },
  separatorWrap: { paddingHorizontal: 20, zIndex: 1 },
  separatorLine: { height: StyleSheet.hairlineWidth, minHeight: 1 },
});
