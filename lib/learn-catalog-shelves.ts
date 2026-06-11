import { LEARN_COLLECTIONS, type LearnCollection, type LearnTopic } from '@/data/learnLibrary';
import { learnText } from '@/lib/learn-i18n';
import { findFirstLesson, resolveLearnTopic } from '@/lib/learn-search';
import type { LanguageMode } from '@/lib/translations';

export type LearnShelfLesson = {
  key: string;
  title: string;
  subtitle?: string;
  topic: LearnTopic;
  collection: LearnCollection;
};

export const LEARN_SHELF_PREVIEW_LIMIT = 8;

/** Dr. Zebene Lemma catechism — mirrors Supabase doctrine_topics sort_order 1–7. */
export const DR_ZEBENE_CATECHISM_TOPICS = [
  {
    slug: 'haymanot',
    titleEn: 'Faith & Doctrine',
    titleAm: 'ሃይማኖት',
    descriptionEn: 'Foundational beliefs of the EOTC',
    descriptionAm: 'የኢ.ኦ.ተ.ቤ. የሃይማኖት መሠረቶች',
    bundled: { collectionId: 'faith-foundation', topicId: 'faith' },
  },
  {
    slug: 'fetret',
    titleEn: 'Creation & Cosmology',
    titleAm: 'ፍጥረት',
    descriptionEn: 'The 22 acts of creation and the heavens',
    descriptionAm: '፳፪ የፍጥረት ተግባራት እና ሰማያት',
    bundled: { collectionId: 'faith-foundation', topicId: 'acts-creation' },
  },
  {
    slug: 'higge-egziabeher',
    titleEn: 'Divine Law',
    titleAm: 'ሕገ እግዚአብሔር',
    descriptionEn: 'The three dispensations of law',
    descriptionAm: 'ሦስቱ የሕግ ምዕራፎች',
    bundled: { collectionId: 'faith-foundation', topicId: 'three-laws' },
  },
  {
    slug: 'mistir',
    titleEn: 'The Five Pillars of Mystery',
    titleAm: 'ምስጢር',
    descriptionEn: 'Core theological mysteries',
    descriptionAm: 'ዋና የሃይማኖት ምስጢራት',
    bundled: { collectionId: 'mysteries-sacraments', topicId: 'five-pillars' },
  },
  {
    slug: 'serate-bete-kristiyan',
    titleEn: 'The Seven Sacraments',
    titleAm: 'ሥርዓተ ቤተ ክርስቲያን',
    descriptionEn: 'Sacraments of the Church',
    descriptionAm: 'የቤተ ክርስቲያን ተንሣኤዎች',
    bundled: { collectionId: 'mysteries-sacraments', topicId: 'seven-sacraments' },
  },
  {
    slug: 'bealat',
    titleEn: 'Feasts of the Lord',
    titleAm: 'በዓላት',
    descriptionEn: 'Major and minor feasts',
    descriptionAm: 'ዋና እና ትንሽ በዓላት',
    bundled: { collectionId: 'feasts', topicId: '9-major' },
  },
  {
    slug: 'himamat',
    titleEn: 'The Passion & The Cross',
    titleAm: 'ሕማማት',
    descriptionEn: 'The sufferings and words of the cross',
    descriptionAm: 'የስብራት ሕማማት እና ቃላት',
    bundled: { collectionId: 'cross-worship', topicId: 'holy-cross' },
  },
] as const;

function findTopicInCollection(collection: LearnCollection, topicId: string): LearnTopic | null {
  const walk = (topics: LearnTopic[]): LearnTopic | null => {
    for (const topic of topics) {
      if (topic.id === topicId || topic.slug === topicId) return topic;
      if (topic.children?.length) {
        const found = walk(topic.children);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(collection.topics);
}

function resolveTopicEntry(
  topic: LearnTopic,
  collection: LearnCollection
): LearnTopic | null {
  const resolved = resolveLearnTopic(topic);
  if (resolved.slug && (resolved.passageCount ?? 1) > 0) return resolved;
  const first = findFirstLesson(collection);
  return first;
}

function flattenReadableLessons(collections: LearnCollection[]): LearnShelfLesson[] {
  const rows: LearnShelfLesson[] = [];
  const seenSlugs = new Set<string>();

  const walk = (collection: LearnCollection, topic: LearnTopic) => {
    if (topic.children?.length) {
      for (const child of topic.children) {
        walk(collection, child);
      }
      return;
    }

    const resolved = resolveLearnTopic(topic);
    if (!resolved.slug || (resolved.passageCount ?? 1) <= 0) return;
    if (seenSlugs.has(resolved.slug)) return;

    seenSlugs.add(resolved.slug);
    rows.push({
      key: `${collection.id}-${resolved.slug}`,
      title: resolved.titleEn,
      subtitle: collection.titleEn,
      topic: resolved,
      collection,
    });
  };

  for (const collection of collections) {
    for (const topic of collection.topics) {
      walk(collection, topic);
    }
  }

  return rows;
}

/** One card per catechism topic on Dr. Zebene Lemma's Faith and Order shelf. */
export function buildFaithAndOrderShelf(
  collections: LearnCollection[],
  mode: LanguageMode
): LearnShelfLesson[] {
  const library = collections.length > 0 ? collections : LEARN_COLLECTIONS;
  const rows: LearnShelfLesson[] = [];

  for (const def of DR_ZEBENE_CATECHISM_TOPICS) {
    const doctrineCollection = library.find((item) => item.id === def.slug);
    const title = learnText(def.titleEn, def.titleAm, mode);

    if (doctrineCollection) {
      const entryTopic =
        findFirstLesson(doctrineCollection) ??
        ({
          id: def.slug,
          slug: def.slug,
          titleEn: def.titleEn,
          titleAm: def.titleAm,
        } satisfies LearnTopic);

      rows.push({
        key: def.slug,
        title,
        subtitle: learnText(
          doctrineCollection.descriptionEn || def.descriptionEn,
          doctrineCollection.descriptionAm || def.descriptionAm,
          mode
        ),
        topic: entryTopic,
        collection: doctrineCollection,
      });
      continue;
    }

    const bundledCollection = LEARN_COLLECTIONS.find(
      (item) => item.id === def.bundled.collectionId
    );
    if (!bundledCollection) continue;

    const bundledTopic =
      findTopicInCollection(bundledCollection, def.bundled.topicId) ??
      findFirstLesson(bundledCollection);
    if (!bundledTopic) continue;

    const entryTopic = resolveTopicEntry(bundledTopic, bundledCollection);
    if (!entryTopic?.slug && !entryTopic?.id) continue;

    rows.push({
      key: def.slug,
      title,
      subtitle: learnText(def.descriptionEn, def.descriptionAm, mode),
      topic: entryTopic,
      collection: {
        ...bundledCollection,
        id: def.slug,
        titleEn: def.titleEn,
        titleAm: def.titleAm,
      },
    });
  }

  return rows;
}

export function getDailyTeachingLessons(
  collections: LearnCollection[],
  mode: LanguageMode,
  date = new Date(),
  count = 3
): LearnShelfLesson[] {
  const lessons = flattenReadableLessons(collections).map((lesson) => ({
    ...lesson,
    title: learnText(lesson.topic.titleEn, lesson.topic.titleAm, mode),
    subtitle: learnText(lesson.collection.titleEn, lesson.collection.titleAm, mode),
  }));

  if (lessons.length === 0) return [];

  const dayIndex = Math.floor(date.getTime() / 86_400_000) % lessons.length;
  const picked: LearnShelfLesson[] = [];
  const pickedKeys = new Set<string>();

  for (
    let offset = 0;
    picked.length < Math.min(count, lessons.length) && offset < lessons.length;
    offset += 1
  ) {
    const lesson = lessons[(dayIndex + offset) % lessons.length];
    if (pickedKeys.has(lesson.key)) continue;
    pickedKeys.add(lesson.key);
    picked.push(lesson);
  }

  return picked;
}
