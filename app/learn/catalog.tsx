// app/learn/catalog.tsx
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LearnCollectionCard } from '@/components/learn/learn-collection-card';
import { CatalogListDivider } from '@/components/ui/catalog-list-divider';
import { AppBackButton } from '@/components/ui/app-back-button';
import { ThemedText } from '@/components/themed-text';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Layout, Space } from '@/constants/theme';
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
import { useThemeTokens } from '@/hooks/use-theme-tokens';
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
  const { palette } = useThemeTokens();
  const [doctrineCollections, setDoctrineCollections] = useState<LearnCollection[]>([]);

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        topBar: {
          marginBottom: Space.s12,
        },
        pageTitle: {
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 40,
          marginBottom: 4,
          color: palette.text,
        },
        pageGeez: {
          fontSize: 18,
          color: palette.gold,
          marginBottom: Space.s8,
        },
        description: {
          marginBottom: Layout.sectionInner,
          lineHeight: 22,
          color: palette.muted,
        },
        list: {
          gap: Space.s12,
        },
      }),
    [palette]
  );

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <AppBackButton style={styles.topBar} onFallback={() => router.push('/(tabs)/learn')} />

      <ThemedText style={styles.pageTitle}>{t('learn.learningCatalog')}</ThemedText>
      {mode !== 'en' ? <ThemedText style={styles.pageGeez}>ትምህርት</ThemedText> : null}
      <ThemedText style={styles.description}>
        The doctrine and teachings of the Ethiopian Orthodox Tewahedo Church.
      </ThemedText>

      <View style={styles.list}>
        {collectionsToRender.map((collection, index) => (
          <View key={collection.id}>
            <LearnCollectionCard
              collection={collection}
              onTopicPress={(topic) => openLesson(topic)}
            />
            {index < collectionsToRender.length - 1 ? <CatalogListDivider marginLeft={0} /> : null}
          </View>
        ))}
      </View>
    </ScreenScrollView>
  );
}
