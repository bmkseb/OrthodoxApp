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
  type TextStyle,
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
import { Layout, Spacing } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
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
  fetchPrayerBook,
  fetchPrayerSections,
  fetchPrayerVerses,
  getPrayerBookDisplay,
  pickPrayerText,
  pickVerseText,
  PRAYER_LANGUAGE_NAMES,
  PRAYER_LANGUAGES,
  sectionHasLanguage,
  type PrayerBook,
  type PrayerLanguage,
  type PrayerSection,
  type PrayerVerse,
} from '@/lib/prayer';
import { usePrayerLanguagePreference } from '@/hooks/use-prayer-language';
import { useFontScale } from '@/hooks/use-font-scale';
import type { ScriptureLang } from '@/types/scripture';

/** Shared scripture persistence (progress/bookmarks/verses) only knows three
 *  scripts; transliteration resumes in English since titles use English too. */
function asScriptureLang(lang: PrayerLanguage): ScriptureLang {
  return lang === 'transliteration' ? 'english' : lang;
}

const NAV_BAR_HEIGHT = 56;
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

// Wudase Mariam closing refrain — highlighted in gold (English, Amharic, Ge'ez).
const WUDASE_REFRAIN =
  /Pray for us,?\s*(?:O!?\s*)?the Holy One!?|ሰአሊ ለነ ቅድስት[።፡]*|ቅድስት\s*ሆይ\s*ለምኝ?ልን[።፡]*/gi;

function splitByRefrain(text: string): { text: string; refrain: boolean }[] {
  const parts: { text: string; refrain: boolean }[] = [];
  const re = new RegExp(WUDASE_REFRAIN.source, WUDASE_REFRAIN.flags);
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), refrain: false });
    parts.push({ text: match[0], refrain: true });
    last = match.index + match[0].length;
    if (re.lastIndex === match.index) re.lastIndex++;
  }
  if (last < text.length) parts.push({ text: text.slice(last), refrain: false });
  return parts;
}

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

const VERSE_BASE_FONT = 17;
const VERSE_BASE_LINE = 28;

/** Renders verse text; Wudase Mariam refrains in gold across English, Amharic, and Ge'ez. */
function PrayerVerseText({
  text,
  style,
  highlightRefrain = false,
}: {
  text: string;
  style?: TextStyle;
  highlightRefrain?: boolean;
}) {
  const { palette } = useThemeTokens();
  const refrainStyle = useMemo(
    () => ({ color: palette.gold, fontStyle: 'italic' as const }),
    [palette.gold]
  );

  if (!highlightRefrain) {
    return <ThemedText style={[styles.verse, style]}>{text}</ThemedText>;
  }

  const parts = splitByRefrain(text);
  if (parts.length <= 1 && !parts[0]?.refrain) {
    return <ThemedText style={[styles.verse, style]}>{text}</ThemedText>;
  }

  return (
    <ThemedText style={[styles.verse, style]}>
      {parts.map((part, i) =>
        part.refrain ? (
          <ThemedText key={i} style={refrainStyle}>
            {part.text}
          </ThemedText>
        ) : (
          part.text
        )
      )}
    </ThemedText>
  );
}

export default function PrayerSectionScreen() {
  const params = useLocalSearchParams<{ slug: string; section: string; lang?: string }>();
  const slug = first(params.slug) || 'daily-prayer';
  const sectionNumber = Math.max(1, Number(first(params.section)) || 1);

  const insets = useSafeAreaInsets();
  const scrollRef = useRef<Animated.ScrollView>(null);

  const [book, setBook] = useState<PrayerBook | null>(null);
  const [sections, setSections] = useState<PrayerSection[]>([]);
  const [verses, setVerses] = useState<PrayerVerse[]>([]);
  const [loading, setLoading] = useState(true);
  // The picker always offers every language; missing content shows a message.
  const { language: lang, setLanguage } = usePrayerLanguagePreference();
  const [selected, setSelected] = useState<PrayerVerse | null>(null);

  const savedMap = useSavedVerseMap();
  const prayerBookId = makePrayerBookId(slug);

  const { scale: fontScale } = useFontScale();
  const { palette } = useThemeTokens();
  const verseFontStyle: TextStyle = {
    fontSize: VERSE_BASE_FONT * fontScale,
    lineHeight: VERSE_BASE_LINE * fontScale,
  };

  const section = sections[sectionNumber - 1] ?? null;
  const bookDisplay = book ? getPrayerBookDisplay(book, lang, slug) : null;
  const bookTitle = bookDisplay?.progressTitle ?? 'Prayer';
  const sectionTitle = section
    ? pickPrayerText({ en: section.titleEn, am: section.titleAm, geez: section.titleGeez }, lang)
    : '';
  const headerTitle = sectionTitle || bookDisplay?.displayTitle || 'Prayer';
  const headerSubtitle = sectionTitle
    ? bookDisplay?.displaySubtitle ?? bookDisplay?.displayTitle
    : bookDisplay?.displaySubtitle;

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
      lang: asScriptureLang(lang),
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
    lang: asScriptureLang(lang),
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

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        fallback: {
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 24,
          paddingVertical: Spacing.xl,
        },
        verseSelected: {
          borderBottomWidth: 1.5,
          borderStyle: 'dotted',
          borderColor: palette.gold,
          paddingBottom: 2,
        },
      }),
    [palette.gold]
  );

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
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={palette.gold} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md, paddingBottom: bottomInset },
        ]}>
        <ScriptureBackBar
          showTextSize
          bookmark={
            book && section
              ? { bookId: prayerBookId, chapter: sectionNumber, lang: asScriptureLang(lang), bookTitle }
              : undefined
          }
        />
        <ScriptureBookHeader title={headerTitle} subtitle={headerSubtitle} />

        {book ? (
          <PrayerLanguageTabs available={PRAYER_LANGUAGES} value={lang} onChange={setLanguage} />
        ) : null}

        {loading ? (
          <ActivityIndicator color={palette.gold} style={styles.spinner} />
        ) : !book || !section ? (
          <EmptyState title="Prayer not found" suggestion="Pull back and try again" />
        ) : !hasContent ? (
          <ThemedText type="muted" style={themedStyles.fallback}>
            This prayer is not yet available in {PRAYER_LANGUAGE_NAMES[lang]}. Please select another
            language.
          </ThemedText>
        ) : (
          <View style={[styles.body, slug === 'wudase-mariam' && styles.wudaseBody]}>
            {visibleVerses.map(({ verse, text }, index) => {
              const id = makeVerseId(prayerBookId, sectionNumber, verse.position);
              const saved = savedMap[id];
              const isSelected = selected?.position === verse.position;
              const isWudase = slug === 'wudase-mariam';
              const showStanzaGap = isWudase && index < visibleVerses.length - 1;
              return (
                <View key={verse.id}>
                  <Pressable
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
                        isSelected && themedStyles.verseSelected,
                      ]}>
                      <PrayerVerseText
                        text={text}
                        style={verseFontStyle}
                        highlightRefrain={isWudase}
                      />
                    </View>
                  </Pressable>
                  {showStanzaGap ? <View style={styles.stanzaGap} /> : null}
                </View>
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
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Layout.pagePadding },
  spinner: { marginTop: 32 },
  fallback: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    paddingVertical: Spacing.xl,
  },
  body: {
    gap: Spacing.lg,
    paddingBottom: Layout.headerContentGap,
  },
  wudaseBody: {
    gap: 0,
  },
  highlightWrap: {
    borderRadius: 4,
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  verse: {
    fontFamily: SERIF,
    fontSize: 17,
    lineHeight: 28,
  },
  stanzaGap: {
    height: Spacing.lg,
  },
  navSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
