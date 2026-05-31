import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { PassageMarkdown } from '@/components/learn/passage-markdown';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Palette, Spacing } from '@/constants/theme';
import { parseScrollTarget, useScrollToTarget } from '@/hooks/use-scroll-to-target';
import { fetchPassagesBySlug, type DoctrinePassage } from '@/lib/doctrine';

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
              const isFocused = highlightPassage === passage.passageNumber;
              return (
                <View
                  key={passage.passageNumber}
                  ref={(node) => registerTargetRef(passage.passageNumber, node)}
                  collapsable={false}
                  style={[styles.passageWrap, isFocused && styles.passageFocused]}>
                  <PassageMarkdown content={passage.content} />
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
  footerSpace: { height: Spacing.xl * 2 },
});
