import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type Animated from 'react-native-reanimated';

import { PrayerLanguageTabs } from '@/components/prayer/prayer-language-tabs';
import { PrayerSectionNavBar } from '@/components/prayer/prayer-section-nav-bar';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { SacredAtmosphere } from '@/components/sacred/sacred-atmosphere';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { ScripturePageScroll } from '@/components/scripture/scripture-page-scroll';
import {
  VerseActionSheet,
  type VerseActionTarget,
} from '@/components/scripture/verse-action-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty-state';
import { Layout, Palette, Spacing } from '@/constants/theme';
import { makePrayerBookId, recordReadingProgress } from '@/hooks/use-reading-progress';
import {
  makeVerseId,
  removeSavedVerse,
  setVerseHighlight,
  setVerseNote,
  useSavedVerseMap,
  type SavedVerseSeed,
} from '@/hooks/use-saved-verses';
import {
  defaultPrayerLanguage,
  fetchPrayerBook,
  fetchPrayerSections,
  fetchPrayerVerses,
  pickPrayerText,
  pickVerseText,
  PRAYER_LANGUAGE_LABELS,
  PRAYER_LANGUAGES,
  sectionHasLanguage,
  type PrayerBook,
  type PrayerLanguage,
  type PrayerSection,
  type PrayerVerse,
} from '@/lib/prayer';

const NAV_BAR_HEIGHT = 56;
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function PrayerSectionScreen() {
  const params = useLocalSearchParams<{ slug: string; section: string; lang?: string }>();
  const slug = first(params.slug) || 'daily-prayer';
  const sectionNumber = Math.max(1, Number(first(params.section)) || 1);
  const requestedLang = first(params.lang) as PrayerLanguage;

  const insets = useSafeAreaInsets();
  const scrollRef = useRef<Animated.ScrollView>(null);

  const [book, setBook] = useState<PrayerBook | null>(null);
  const [sections, setSections] = useState<PrayerSection[]>([]);
  const [verses, setVerses] = useState<PrayerVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<PrayerLanguage>(
    PRAYER_LANGUAGES.includes(requestedLang) ? requestedLang : 'english'
  );
  const [selected, setSelected] = useState<PrayerVerse | null>(null);

  const savedMap = useSavedVerseMap();
  const prayerBookId = makePrayerBookId(slug);

  const section = sections[sectionNumber - 1] ?? null;
  const bookTitle = book
    ? pickPrayerText({ en: book.titleEn, am: book.titleAm, geez: book.titleGeez }, lang)
    : 'Prayer';
  const sectionTitle = section
    ? pickPrayerText({ en: section.titleEn, am: section.titleAm, geez: section.titleGeez }, lang)
    : '';

  // Load book + sections (for navigation and titles), then the active section's verses.
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const fetchedBook = await fetchPrayerBook(slug);
        if (!active) return;
        setBook(fetchedBook);
        if (!fetchedBook) {
          setSections([]);
          setVerses([]);
          return;
        }
        setLang((prev) =>
          fetchedBook.availableLanguages.includes(prev)
            ? prev
            : defaultPrayerLanguage(fetchedBook.availableLanguages)
        );
        const fetchedSections = await fetchPrayerSections(fetchedBook.id);
        if (!active) return;
        setSections(fetchedSections);
        const current = fetchedSections[sectionNumber - 1];
        const fetchedVerses = current ? await fetchPrayerVerses(current.id) : [];
        if (active) setVerses(fetchedVerses);
      } catch {
        if (active) {
          setSections([]);
          setVerses([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, sectionNumber, reloadKey]);

  const onRefresh = useCallback(() => setReloadKey((k) => k + 1), []);

  // Resume support: record this prayer position for Continue Reading.
  useEffect(() => {
    if (!book || !section || sections.length === 0) return;
    void recordReadingProgress({
      bookId: prayerBookId,
      chapter: sectionNumber,
      totalChapters: sections.length,
      lang,
      updatedAt: Date.now(),
      title: bookTitle,
      subtitle: sectionTitle,
    });
  }, [book, section, sections.length, sectionNumber, lang, prayerBookId, bookTitle, sectionTitle]);

  const visibleVerses = useMemo(
    () =>
      verses
        .map((verse) => ({ verse, text: pickVerseText(verse, lang) }))
        .filter((v): v is { verse: PrayerVerse; text: string } => v.text !== null),
    [verses, lang]
  );
  const hasContent = sectionHasLanguage(verses, lang);

  const seedFor = (verse: PrayerVerse): SavedVerseSeed => ({
    bookId: prayerBookId,
    chapter: sectionNumber,
    verse: verse.position,
    lang,
    text: pickVerseText(verse, lang) ?? '',
    bookTitle,
  });

  const selectedId = selected ? makeVerseId(prayerBookId, sectionNumber, selected.position) : null;
  const selectedSaved = selectedId ? savedMap[selectedId] : undefined;
  const target: VerseActionTarget | null = selected
    ? {
        reference: sectionTitle || bookTitle,
        text: pickVerseText(selected, lang) ?? '',
        color: selectedSaved?.color ?? null,
        note: selectedSaved?.note ?? null,
      }
    : null;

  const bottomInset = Math.max(insets.bottom, Spacing.md) + NAV_BAR_HEIGHT;

  return (
    <ThemedView style={styles.root}>
      <SacredAtmosphere />
      <ParchmentGrainOverlay />
      <ScripturePageScroll
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        trackInsetTop={insets.top + Spacing.md}
        trackInsetBottom={bottomInset}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Palette.gold} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md, paddingBottom: bottomInset },
        ]}>
        <ScriptureBackBar
          bookmark={
            book && section
              ? { bookId: prayerBookId, chapter: sectionNumber, lang, bookTitle }
              : undefined
          }
        />
        <ScriptureBookHeader title={sectionTitle || bookTitle} subtitle={bookTitle} />

        {book ? (
          <PrayerLanguageTabs available={book.availableLanguages} value={lang} onChange={setLang} />
        ) : null}

        {loading ? (
          <ActivityIndicator color={Palette.gold} style={styles.spinner} />
        ) : !book || !section ? (
          <EmptyState title="Prayer not found" suggestion="Pull back and try again" />
        ) : !hasContent ? (
          <ThemedText style={styles.fallback}>
            Not yet available in {PRAYER_LANGUAGE_LABELS[lang]}.
          </ThemedText>
        ) : (
          <View style={styles.body}>
            {visibleVerses.map(({ verse, text }) => {
              const id = makeVerseId(prayerBookId, sectionNumber, verse.position);
              const saved = savedMap[id];
              const isSelected = selected?.position === verse.position;
              return (
                <Pressable
                  key={verse.id}
                  delayLongPress={250}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    setSelected(verse);
                  }}
                  accessibilityRole="button"
                  accessibilityHint="Press and hold to highlight or save this prayer">
                  <View
                    style={[
                      styles.highlightWrap,
                      saved?.color ? { backgroundColor: saved.color } : null,
                      isSelected && styles.verseSelected,
                    ]}>
                    <ThemedText style={styles.verse}>{text}</ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScripturePageScroll>

      <View style={styles.navSlot}>
        <PrayerSectionNavBar
          slug={slug}
          section={sectionNumber}
          total={sections.length}
          lang={lang}
        />
      </View>

      <VerseActionSheet
        visible={selected != null}
        target={target}
        onClose={() => setSelected(null)}
        onHighlight={(color) => {
          if (selected) setVerseHighlight(seedFor(selected), color);
        }}
        onSaveNote={(note) => {
          if (selected) setVerseNote(seedFor(selected), note);
          setSelected(null);
        }}
        onRemove={() => {
          if (selectedId) removeSavedVerse(selectedId);
          setSelected(null);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.pagePadding },
  spinner: { marginTop: 32 },
  fallback: {
    color: Palette.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    paddingVertical: Spacing.xl,
  },
  body: {
    gap: Spacing.lg,
    paddingBottom: Layout.headerContentGap,
  },
  highlightWrap: {
    borderRadius: 4,
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  verseSelected: {
    borderBottomWidth: 1.5,
    borderStyle: 'dotted',
    borderColor: Palette.gold,
    paddingBottom: 2,
  },
  verse: {
    fontFamily: SERIF,
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
  },
  navSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
