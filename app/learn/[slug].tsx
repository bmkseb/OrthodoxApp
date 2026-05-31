import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { parseScrollTarget, useScrollToTarget } from '@/hooks/use-scroll-to-target';
import { fetchPassagesBySlug, type DoctrinePassage } from '@/lib/doctrine';

/**
 * Doctrine passages are prose, not biblical verses, so we drop the verse-number
 * gutter and render one cohesive reading: short title-case lines become bold
 * mini-headers, "1." / "-" lines become bullet rows, quotation-wrapped lines
 * become italic pull-quotes (with their reference), and the rest are paragraphs.
 */
type Block =
  | { kind: 'header'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; marker: string; text: string }
  | { kind: 'quote'; text: string; reference: string };

const QUOTE_OPENERS = ['"', '\u201C']; // " and “
const SENTENCE_END = /[.!?:;,]$/;

function parsePassage(raw: string): Block {
  const text = raw.trim();

  // Quote: starts with a quotation mark. Pull out a trailing reference if present.
  if (QUOTE_OPENERS.some((q) => text.startsWith(q))) {
    const match = text.match(/^["\u201C]([\s\S]*?)["\u201D]\s*(.*)$/);
    if (match) {
      return { kind: 'quote', text: match[1].trim(), reference: match[2].trim() };
    }
    return { kind: 'quote', text: text.replace(/^["\u201C]|["\u201D]$/g, '').trim(), reference: '' };
  }

  // List item: "1." / "2)" numbered, or "-" / "*" / "•" bulleted.
  const numbered = text.match(/^(\d+)[.)]\s+(.*)$/s);
  if (numbered) {
    return { kind: 'list', marker: `${numbered[1]}.`, text: numbered[2].trim() };
  }
  const bulleted = text.match(/^[-*\u2022]\s+(.*)$/s);
  if (bulleted) {
    return { kind: 'list', marker: '\u2022', text: bulleted[1].trim() };
  }

  // Mini-header: a short title-case line with no sentence-ending punctuation.
  const wordCount = text.split(/\s+/).length;
  const startsUpper = /^[A-Z\u1200-\u137F]/.test(text);
  if (text.length <= 70 && wordCount <= 10 && startsUpper && !SENTENCE_END.test(text)) {
    return { kind: 'header', text };
  }

  return { kind: 'paragraph', text };
}

function PassageBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case 'header':
      return <ThemedText style={styles.header}>{block.text}</ThemedText>;
    case 'list':
      return (
        <View style={styles.listRow}>
          <ThemedText style={styles.listMarker}>{block.marker}</ThemedText>
          <ThemedText style={styles.listText}>{block.text}</ThemedText>
        </View>
      );
    case 'quote':
      return (
        <View style={styles.quoteBlock}>
          <ThemedText style={styles.quoteText}>{`\u201C${block.text}\u201D`}</ThemedText>
          {block.reference ? (
            <ThemedText style={styles.quoteRef}>{block.reference}</ThemedText>
          ) : null}
        </View>
      );
    default:
      return <ThemedText style={styles.paragraph}>{block.text}</ThemedText>;
  }
}

export default function DoctrineLessonScreen() {
  const { slug, title, passage: passageParam } = useLocalSearchParams<{
    slug: string;
    title?: string;
    passage?: string;
  }>();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const scrollToPassage = parseScrollTarget(passageParam);

  const [passages, setPassages] = useState<DoctrinePassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightPassage, setHighlightPassage] = useState<number | undefined>(scrollToPassage);

  const contentReady = !loading && passages.length > 0;
  const { registerTargetRef } = useScrollToTarget(
    scrollRef,
    contentRef,
    scrollToPassage,
    contentReady,
    56
  );

  useEffect(() => {
    setHighlightPassage(scrollToPassage);
  }, [scrollToPassage, slug]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPassagesBySlug(slug);
      setPassages(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this lesson.');
      setPassages([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const heading = title?.trim() || 'Lesson';

  return (
    <ScreenScrollView ref={scrollRef} includeFloatingChrome={false}>
      <View ref={contentRef} collapsable={false}>
        <ScriptureBackBar />
        <ScriptureBookHeader title={heading} subtitle="Doctrine" />

        {loading ? (
          <ActivityIndicator color={Palette.gold} style={styles.spinner} />
        ) : error ? (
          <EmptyState title="Couldn’t load this lesson" suggestion="Pull back and try again" />
        ) : passages.length === 0 ? (
          <EmptyState title="No passages yet" suggestion="This lesson has no content available" />
        ) : (
          <View style={styles.reading}>
            {passages.map((passage) => {
              const block = parsePassage(passage.content);
              const isFocused = highlightPassage === passage.passageNumber;
              return (
                <View
                  key={passage.passageNumber}
                  ref={(node) => registerTargetRef(passage.passageNumber, node)}
                  collapsable={false}
                  style={[styles.passageWrap, isFocused && styles.passageFocused]}>
                  <PassageBlock block={block} />
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.footerSpace} />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  spinner: { marginVertical: Spacing.xl },
  reading: {},
  passageWrap: {
    marginBottom: Spacing.xs,
  },
  passageFocused: {
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginHorizontal: -Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
  },
  header: {
    fontSize: 19,
    fontWeight: '700',
    color: Palette.gold,
    letterSpacing: -0.2,
    lineHeight: 26,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
    marginBottom: Spacing.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  listMarker: {
    minWidth: 18,
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '700',
    color: Palette.gold,
  },
  listText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
  },
  quoteBlock: {
    marginVertical: Spacing.sm,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: Palette.gold,
  },
  quoteText: {
    fontSize: 16.5,
    lineHeight: 26,
    fontStyle: 'italic',
    color: 'rgba(245, 236, 215, 0.9)',
  },
  quoteRef: {
    marginTop: Spacing.xs,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Palette.gold,
  },
  footerSpace: { height: Spacing.xl * 2 },
});
