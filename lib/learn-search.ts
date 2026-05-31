import type { LearnCollection, LearnTopic } from '@/data/learnLibrary';
import { learnText } from '@/lib/learn-i18n';
import type { LanguageMode } from '@/lib/translations';

export type LearnHeaderHit = {
  id: string;
  title: string;
  subtitle?: string;
  topic: LearnTopic;
  collection: LearnCollection;
};

type FlatTopic = {
  topic: LearnTopic;
  collection: LearnCollection;
  breadcrumb: string;
};

function flattenTopics(collections: LearnCollection[]): FlatTopic[] {
  const rows: FlatTopic[] = [];

  const walk = (collection: LearnCollection, topic: LearnTopic, trail: string[]) => {
    const path = [...trail, topic.titleEn];
    rows.push({
      topic,
      collection,
      breadcrumb: path.slice(0, -1).join(' · '),
    });
    for (const child of topic.children ?? []) {
      walk(collection, child, path);
    }
  };

  for (const collection of collections) {
    for (const topic of collection.topics) {
      walk(collection, topic, [collection.titleEn]);
    }
  }

  return rows;
}

function topicMatches(topic: LearnTopic, collection: LearnCollection, q: string, raw: string): boolean {
  return (
    topic.titleEn.toLowerCase().includes(q) ||
    topic.titleAm.toLowerCase().includes(q) ||
    topic.titleAm.includes(raw) ||
    collection.titleEn.toLowerCase().includes(q) ||
    collection.titleAm.toLowerCase().includes(q) ||
    collection.titleAm.includes(raw) ||
    collection.subtitleEn.toLowerCase().includes(q) ||
    collection.descriptionEn.toLowerCase().includes(q)
  );
}

/** Topic, collection, and section headings across the Learn library. */
export function searchLearnHeaders(
  collections: LearnCollection[],
  query: string,
  mode: LanguageMode
): LearnHeaderHit[] {
  const raw = query.trim();
  const q = raw.toLowerCase();
  if (!q) return [];

  const hits: LearnHeaderHit[] = [];
  const seen = new Set<string>();

  const push = (hit: LearnHeaderHit) => {
    if (seen.has(hit.id)) return;
    seen.add(hit.id);
    hits.push(hit);
  };

  for (const collection of collections) {
    const collectionTitle = learnText(collection.titleEn, collection.titleAm, mode);
    if (
      collection.titleEn.toLowerCase().includes(q) ||
      collection.titleAm.toLowerCase().includes(q) ||
      collection.titleAm.includes(raw)
    ) {
      push({
        id: `collection-${collection.id}`,
        title: collectionTitle,
        subtitle: learnText(collection.descriptionEn, collection.descriptionAm, mode),
        topic: {
          id: collection.id,
          slug: collection.id,
          titleEn: collection.titleEn,
          titleAm: collection.titleAm,
          children: collection.topics,
        },
        collection,
      });
    }
  }

  for (const row of flattenTopics(collections)) {
    if (!topicMatches(row.topic, row.collection, q, raw)) continue;

    const title = learnText(row.topic.titleEn, row.topic.titleAm, mode);
    const collectionTitle = learnText(row.collection.titleEn, row.collection.titleAm, mode);
    const subtitle = row.breadcrumb || collectionTitle;

    push({
      id: `topic-${row.collection.id}-${row.topic.id}`,
      title,
      subtitle: subtitle === title ? undefined : subtitle,
      topic: row.topic,
      collection: row.collection,
    });
  }

  return hits.slice(0, 16);
}

/** First leaf lesson with readable content under a topic header. */
export function resolveLearnTopic(topic: LearnTopic): LearnTopic {
  if ((topic.passageCount ?? 1) > 0 && topic.slug) return topic;
  for (const child of topic.children ?? []) {
    const resolved = resolveLearnTopic(child);
    if (resolved.slug && (resolved.passageCount ?? 1) > 0) return resolved;
  }
  return topic;
}

/** First leaf lesson with readable content in a collection. */
export function findFirstLesson(collection: LearnCollection): LearnTopic | null {
  const walk = (topics: LearnTopic[]): LearnTopic | null => {
    for (const topic of topics) {
      const resolved = resolveLearnTopic(topic);
      if (resolved.slug && (resolved.passageCount ?? 1) > 0) return resolved;
      if (topic.children?.length) {
        const child = walk(topic.children);
        if (child) return child;
      }
    }
    return null;
  };
  return walk(collection.topics);
}
