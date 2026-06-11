// app/learn/catalog.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LearnCollectionCard } from '@/components/learn/learn-collection-card';
import { CatalogListDivider } from '@/components/ui/catalog-list-divider';
import { AppBackButton } from '@/components/ui/app-back-button';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Layout, Palette, Spacing } from '@/constants/theme';
import {
  LEARN_COLLECTIONS,
  type LearnCollection,
  type LearnTopic,
} from '@/data/learnLibrary';
import {
  countDoctrineLessons,
  fetchDoctrineOutline,
  type DoctrineSubtopic,
} from '@/lib/doctrine';
import { useTranslation } from '@/hooks/use-translation';

function mapDoctrineSubtopic(sub: DoctrineSubtopic): LearnTopic {
  return {
    id: sub.slug,
    slug: sub.slug,
    titleEn: sub.title,
    titleAm: sub.titleAm ?? '',
    passageCount: sub.passageCount,
    children: sub.children.map(mapDoctrineSubtopic),
  };
}

export default function LearnCatalogScreen() {
  const { t, mode } = useTranslation();
  const [doctrineCollections, setDoctrineCollections] = useState<LearnCollection[]>([]);

  // Load the doctrine outline from Supabase; fall back to the bundled library.
  useEffect(() => {
    let active = true;
    fetchDoctrineOutline()
      .then((topics) => {
        if (!active) return;
        const mapped: LearnCollection[] = topics
          .filter((topic) => topic.subtopics.length > 0)
          .map((topic) => {
            const topicsTree = topic.subtopics.map(mapDoctrineSubtopic);
            const lessonCount = countDoctrineLessons(topic.subtopics);
            return {
              id: topic.slug,
              titleEn: topic.title,
              titleAm: topic.titleAm ?? '',
              subtitleEn: '',
              subtitleAm: '',
              descriptionEn: `${lessonCount} lessons`,
              descriptionAm: `${lessonCount} ትምህርቶች`,
              icon: 'book',
              topics: topicsTree,
            };
          });
        setDoctrineCollections(mapped);
      })
      .catch(() => {
        // Keep the bundled fallback on any fetch/RLS error.
      });
    return () => {
      active = false;
    };
  }, []);

  const collectionsToRender =
    doctrineCollections.length > 0 ? doctrineCollections : LEARN_COLLECTIONS;

  const openLesson = (topic: LearnTopic) => {
    const slug = topic.slug ?? topic.id;
    const params = new URLSearchParams({ title: topic.titleEn });
    router.push(`/learn/${slug}?${params.toString()}` as never);
  };

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <AppBackButton
        style={styles.topBar}
        onFallback={() => router.push('/(tabs)/learn')}
      />

      <ThemedText style={styles.pageTitle}>{t('learn.learningCatalog')}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>ትምህርት</ThemedText> : null}
      <ThemedText type="muted" style={styles.description}>
        The doctrine and teachings of the Ethiopian Orthodox Tewahedo Church.
      </ThemedText>

      {collectionsToRender.map((collection, index) => (
        <View key={collection.id}>
          <LearnCollectionCard
            collection={collection}
            onTopicPress={(topic) => openLesson(topic)}
          />
          {index < collectionsToRender.length - 1 ? (
            <CatalogListDivider marginLeft={0} />
          ) : null}
        </View>
      ))}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: Spacing.md,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 4,
  },
  pageGeez: {
    fontSize: 18,
    color: Palette.gold,
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Layout.sectionGap,
    lineHeight: 22,
  },
});
