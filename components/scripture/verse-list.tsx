import * as Haptics from 'expo-haptics';
import { Fragment, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import {
  VerseActionSheet,
  type VerseActionTarget,
} from '@/components/scripture/verse-action-sheet';
import { Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import {
  makeVerseId,
  removeSavedVerse,
  setVerseHighlight,
  setVerseNote,
  useSavedVerseMap,
  type SavedVerseSeed,
} from '@/hooks/use-saved-verses';
import { useFontScale } from '@/hooks/use-font-scale';
import { formatScriptureNumber, parseFootnotes, pickVerseText } from '@/lib/scripture';
import type { Footnote, ScriptureLang, VerseRecord } from '@/types/scripture';

const FOOTNOTE_MARKER = '\u2020'; // †
const VERSE_BASE_FONT = 17;
const VERSE_BASE_LINE = 28;

type VerseListProps = {
  verses: VerseRecord[];
  lang: ScriptureLang;
  bookId: string;
  chapter: number;
  bookTitle: string;
  /** Scroll target from deep links (search results, bookmarks). */
  scrollToVerse?: number;
  /** Attach a native ref for each verse row (used for scroll-to-verse). */
  registerVerseRef?: (verse: number, node: View | null) => void;
};

/** Renders verse text, turning inline † markers into styled superscript daggers. */
function VerseText({
  text,
  scale,
  verseTextStyle,
  inlineMarkerStyle,
}: {
  text: string;
  scale: number;
  verseTextStyle: object;
  inlineMarkerStyle: object;
}) {
  const dynamic = { fontSize: VERSE_BASE_FONT * scale, lineHeight: VERSE_BASE_LINE * scale };
  if (!text.includes(FOOTNOTE_MARKER)) {
    return <ThemedText style={[verseTextStyle, dynamic]}>{text}</ThemedText>;
  }

  const segments = text.split(FOOTNOTE_MARKER);
  return (
    <ThemedText style={[verseTextStyle, dynamic]}>
      {segments.map((segment, i) => (
        <Fragment key={i}>
          {segment}
          {i < segments.length - 1 ? (
            <ThemedText style={[inlineMarkerStyle, { lineHeight: dynamic.lineHeight }]}>
              {FOOTNOTE_MARKER}
            </ThemedText>
          ) : null}
        </Fragment>
      ))}
    </ThemedText>
  );
}

export function VerseList({
  verses,
  lang,
  bookId,
  chapter,
  bookTitle,
  scrollToVerse,
  registerVerseRef,
}: VerseListProps) {
  const savedMap = useSavedVerseMap();
  const { scale } = useFontScale();
  const { palette } = useThemeTokens();
  const [selected, setSelected] = useState<VerseRecord | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        list: { gap: Layout.titleSubtitleGap },
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          paddingVertical: 4,
        },
        verseNum: {
          width: 28,
          fontSize: 14,
          fontWeight: '700',
          color: palette.gold,
          textAlign: 'right',
          lineHeight: 24,
        },
        verseBody: {
          flex: 1,
        },
        highlightWrap: {
          borderRadius: 4,
          paddingHorizontal: 4,
          marginHorizontal: -4,
        },
        verseSelected: {
          borderBottomWidth: 1.5,
          borderStyle: 'dotted',
          borderColor: palette.gold,
          paddingBottom: 2,
        },
        verseFocused: {
          backgroundColor: 'rgba(201, 147, 58, 0.14)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(201, 147, 58, 0.45)',
        },
        verseText: {
          fontSize: 17,
          lineHeight: 28,
        },
        inlineMarker: {
          fontSize: 12,
          lineHeight: 28,
          color: palette.gold,
          fontWeight: '700',
        },
        noteRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Space.s4,
          marginTop: Space.s4,
          paddingLeft: 4,
        },
        noteText: {
          flex: 1,
          fontSize: 13,
          lineHeight: 18,
          fontStyle: 'italic',
        },
        footnotes: {
          marginTop: Space.s24,
          gap: Space.s8,
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: palette.mutedGold,
          marginBottom: Space.s8,
        },
        footnoteRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Space.s8,
        },
        footnoteMarker: {
          fontSize: 13,
          lineHeight: 20,
          color: palette.gold,
          fontWeight: '700',
        },
        footnoteText: {
          flex: 1,
          fontSize: 13,
          lineHeight: 20,
        },
        footnoteRef: {
          fontSize: 13,
          lineHeight: 20,
          color: palette.gold,
          fontWeight: '600',
        },
      }),
    [palette]
  );

  const footnotes: Footnote[] = verses.flatMap((verse) => parseFootnotes(verse, lang));

  const selectedId = selected ? makeVerseId(bookId, chapter, selected.verse) : null;
  const selectedSaved = selectedId ? savedMap[selectedId] : undefined;

  const seedFor = (verse: VerseRecord): SavedVerseSeed => ({
    bookId,
    chapter,
    verse: verse.verse,
    lang,
    text: pickVerseText(verse, lang),
    bookTitle,
  });

  const target: VerseActionTarget | null = selected
    ? {
        reference: `${bookTitle} ${chapter}:${selected.verse}`,
        text: pickVerseText(selected, lang),
        color: selectedSaved?.color ?? null,
        note: selectedSaved?.note ?? null,
      }
    : null;

  return (
    <View style={styles.list}>
      {verses.map((verse) => {
        const id = makeVerseId(bookId, chapter, verse.verse);
        const saved = savedMap[id];
        const isSelected = selected?.verse === verse.verse;
        const isFocused = scrollToVerse === verse.verse;
        return (
          <View
            key={verse.verse}
            ref={(node) => registerVerseRef?.(verse.verse, node)}
            collapsable={false}>
            <Pressable
              style={styles.row}
              delayLongPress={250}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                setSelected(verse);
              }}
              accessibilityRole="button"
              accessibilityHint="Press and hold to highlight or save this verse"
              accessibilityLabel={`${bookTitle} ${chapter}:${verse.verse}`}>
              <ThemedText style={[styles.verseNum, { lineHeight: VERSE_BASE_LINE * scale }]}>
                {formatScriptureNumber(verse.verse, lang)}
              </ThemedText>
              <View style={styles.verseBody}>
                <View
                  style={[
                    styles.highlightWrap,
                    saved?.color ? { backgroundColor: saved.color } : null,
                    isSelected && styles.verseSelected,
                    isFocused && styles.verseFocused,
                  ]}>
                  <VerseText
                    text={pickVerseText(verse, lang)}
                    scale={scale}
                    verseTextStyle={styles.verseText}
                    inlineMarkerStyle={styles.inlineMarker}
                  />
                </View>
                {saved?.note ? (
                  <View style={styles.noteRow}>
                    <Icon name="bookmark" size={12} color={palette.gold} />
                    <ThemedText type="muted" style={styles.noteText} numberOfLines={2}>
                      {saved.note}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </View>
        );
      })}

      {footnotes.length > 0 ? (
        <View style={styles.footnotes}>
          <View style={styles.divider} />
          {footnotes.map((fn, i) => (
            <View key={`${fn.ref}-${i}`} style={styles.footnoteRow}>
              <ThemedText style={styles.footnoteMarker}>{FOOTNOTE_MARKER}</ThemedText>
              <ThemedText type="muted" style={styles.footnoteText}>
                {fn.ref ? <ThemedText style={styles.footnoteRef}>{fn.ref} </ThemedText> : null}
                {fn.text}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

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
    </View>
  );
}
