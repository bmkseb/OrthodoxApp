import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LearnTopicRow } from '@/components/learn/learn-topic-row';
import type { LearnCollection, LearnTopic } from '@/data/learnLibrary';
import { learnText, levelLabel } from '@/lib/learn-i18n';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { Layout, Palette, Spacing } from '@/constants/theme';

type SearchGroup = {
  collection: LearnCollection;
  topics: LearnTopic[];
};

type LearnSearchResultsProps = {
  groups: SearchGroup[];
  onTopicPress?: (topic: LearnTopic, collection: LearnCollection) => void;
};

export function LearnSearchResults({ groups, onTopicPress }: LearnSearchResultsProps) {
  const { mode, t } = useTranslation();

  if (groups.length === 0) {
    return (
      <ThemedText type="muted" style={styles.empty}>
        {t('learn.noResults')}
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.heading}>{t('learn.searchResults')}</ThemedText>
      {groups.map((group) => (
        <View key={group.collection.id} style={styles.group}>
          <ThemedText style={styles.collectionTitle}>
            {learnText(group.collection.titleEn, group.collection.titleAm, mode)}
          </ThemedText>
          {group.topics.map((topic, index) => (
            <LearnTopicRow
              key={topic.id}
              title={learnText(topic.titleEn, topic.titleAm, mode)}
              readMin={topic.readMin}
              levelLabel={topic.level ? levelLabel(topic.level, mode) : undefined}
              isLast={index === group.topics.length - 1}
              onPress={() => onTopicPress?.(topic, group.collection)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, marginBottom: Layout.sectionHeaderGap },
  heading: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.mutedGold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  group: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    backgroundColor: 'rgba(22, 19, 16, 0.75)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  collectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.muted,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm + 2,
    paddingBottom: 4,
    letterSpacing: 0.2,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
