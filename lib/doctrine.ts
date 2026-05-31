import { getSupabase } from './supabase';
import { buildSearchSnippet } from './search-snippets';

/**
 * Doctrine content system powering the Learn section.
 *
 * Schema: doctrine_topics → doctrine_subtopics → doctrine_passages.
 *  - Topics group subtopics (rendered as the expandable collection cards).
 *  - Subtopics are the individual lesson cards (addressed by kebab-case slug).
 *  - Passages are verse-style numbered content belonging to a subtopic.
 *
 * RLS allows public read on all three tables, so the anon key works for reads.
 */

export type DoctrineSubtopic = {
  id: string;
  title: string;
  titleAm: string | null;
  slug: string;
  sortOrder: number;
  parentSubtopicId: string | null;
  passageCount: number;
  children: DoctrineSubtopic[];
};

export type DoctrineTopic = {
  id: string;
  title: string;
  titleAm: string | null;
  slug: string;
  sortOrder: number;
  subtopics: DoctrineSubtopic[];
};

export type DoctrinePassage = {
  passageNumber: number;
  content: string;
};

export type DoctrineSearchResult = {
  subtopic: string;
  subtopicSlug: string;
  passageNumber: number;
  content: string;
  snippet: string;
};

type SubtopicRow = {
  id: string | number;
  title: string;
  title_am: string | null;
  slug: string;
  sort_order: number | null;
  parent_subtopic_id: string | number | null;
  doctrine_passages: { count: number }[] | null;
};

type TopicRow = {
  id: string | number;
  title: string;
  title_am: string | null;
  slug: string;
  sort_order: number | null;
  doctrine_subtopics: SubtopicRow[] | null;
};

type PassageRow = {
  passage_number: number;
  content: string;
};

type SearchRow = {
  passage_number: number;
  content: string;
  doctrine_subtopics:
    | { title: string; slug: string }
    | { title: string; slug: string }[]
    | null;
};

type FlatSubtopic = Omit<DoctrineSubtopic, 'children'>;

/** Build a nested tree and drop branches with no readable content. */
function buildSubtopicTree(flat: FlatSubtopic[]): DoctrineSubtopic[] {
  const nodes = new Map<string, DoctrineSubtopic>();
  for (const item of flat) {
    nodes.set(item.id, { ...item, children: [] });
  }

  const roots: DoctrineSubtopic[] = [];
  for (const node of nodes.values()) {
    if (node.parentSubtopicId && nodes.has(node.parentSubtopicId)) {
      nodes.get(node.parentSubtopicId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const prune = (node: DoctrineSubtopic): DoctrineSubtopic | null => {
    node.children = node.children
      .map(prune)
      .filter((child): child is DoctrineSubtopic => child != null)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (node.passageCount === 0 && node.children.length === 0) return null;
    return node;
  };

  return roots
    .map(prune)
    .filter((node): node is DoctrineSubtopic => node != null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Count subtopics that actually have passage content (for the collection badge). */
export function countDoctrineLessons(subtopics: DoctrineSubtopic[]): number {
  return subtopics.reduce(
    (total, sub) => total + (sub.passageCount > 0 ? 1 : 0) + countDoctrineLessons(sub.children),
    0
  );
}

/**
 * All topics with their nested subtopics, ordered for display. Only subtopics
 * that actually have passages are returned (placeholder rows are hidden), and
 * topics left with no content are dropped. Mirrors the outline query.
 */
export async function fetchDoctrineOutline(): Promise<DoctrineTopic[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const withAmharic =
    'id, title, title_am, slug, sort_order, doctrine_subtopics ( id, title, title_am, slug, sort_order, parent_subtopic_id, doctrine_passages(count) )';
  const withoutAmharic =
    'id, title, slug, sort_order, doctrine_subtopics ( id, title, slug, sort_order, parent_subtopic_id, doctrine_passages(count) )';

  let { data, error } = await supabase
    .from('doctrine_topics')
    .select(withAmharic)
    .order('sort_order', { ascending: true });

  // Before the reorganization migration runs the title_am column won't exist
  // (Postgres error 42703). Retry without it so the page still shows content.
  if (error?.code === '42703') {
    const fallback = await supabase
      .from('doctrine_topics')
      .select(withoutAmharic)
      .order('sort_order', { ascending: true });
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) throw error;

  const rows = (data ?? []) as TopicRow[];
  return rows
    .map((topic) => {
      const flat: FlatSubtopic[] = (topic.doctrine_subtopics ?? []).map((s) => ({
        id: String(s.id),
        title: s.title,
        titleAm: s.title_am ?? null,
        slug: s.slug,
        sortOrder: s.sort_order ?? 0,
        parentSubtopicId: s.parent_subtopic_id != null ? String(s.parent_subtopic_id) : null,
        passageCount: s.doctrine_passages?.[0]?.count ?? 0,
      }));

      return {
        id: String(topic.id),
        title: topic.title,
        titleAm: topic.title_am ?? null,
        slug: topic.slug,
        sortOrder: topic.sort_order ?? 0,
        subtopics: buildSubtopicTree(flat),
      };
    })
    .filter((topic) => topic.subtopics.length > 0);
}

/**
 * Verse-style passages for a subtopic, ordered by passage_number ascending.
 * `slug` is the subtopic's kebab-case slug (e.g. 'faith', 'mystery-of-baptism').
 */
export async function fetchPassagesBySlug(slug: string): Promise<DoctrinePassage[]> {
  const supabase = getSupabase();
  if (!supabase || !slug) return [];

  const { data, error } = await supabase
    .from('doctrine_passages')
    .select('passage_number, content, doctrine_subtopics!inner ( slug )')
    .eq('doctrine_subtopics.slug', slug)
    .order('passage_number', { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as PassageRow[];
  return rows.map((r) => ({ passageNumber: r.passage_number, content: r.content }));
}

/** Full-text search across all passages (English config), capped at 20 results. */
export async function searchDoctrinePassages(term: string): Promise<DoctrineSearchResult[]> {
  const supabase = getSupabase();
  if (!supabase || !term.trim()) return [];

  const { data, error } = await supabase
    .from('doctrine_passages')
    .select('passage_number, content, doctrine_subtopics!inner ( title, slug )')
    .textSearch('content', term, { type: 'plain', config: 'english' })
    .limit(20);

  let rows = data;
  let queryError = error;

  if (queryError) {
    const fallback = await supabase
      .from('doctrine_passages')
      .select('passage_number, content, doctrine_subtopics!inner ( title, slug )')
      .ilike('content', `%${term.trim()}%`)
      .limit(20);
    rows = fallback.data;
    queryError = fallback.error;
  }

  if (queryError) throw queryError;

  const resultRows = (rows ?? []) as SearchRow[];
  return resultRows.map((r) => {
    const sub = Array.isArray(r.doctrine_subtopics)
      ? r.doctrine_subtopics[0]
      : r.doctrine_subtopics;
    return {
      subtopic: sub?.title ?? '',
      subtopicSlug: sub?.slug ?? '',
      passageNumber: r.passage_number,
      content: r.content,
      snippet: buildSearchSnippet(r.content, term),
    };
  });
}
