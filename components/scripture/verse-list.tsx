import * as Haptics from 'expo-haptics';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import {
  VerseActionSheet,
  type VerseActionTarget,
} from '@/components/scripture/verse-action-sheet';
import { Layout, Palette, Space } from '@/constants/theme';
import {
  makeVerseId,
  removeSavedVerse,
  setVerseHighlight,
  setVerseNote,
  useSavedVerseMap,
  type SavedVerseSeed,
} from '@/hooks/use-saved-verses';
import { parseFootnotes, pickVerseText } from '@/lib/scripture';
import type { Footnote, ScriptureLang, VerseRecord } from '@/types/scripture';

const FOOTNOTE_MARKER = '\u2020'; // †

type VerseListProps = {
  verses: VerseRecord[];
  lang: ScriptureLang;
  bookId: string;
  chapter: number;
  bookTitle: string;
};

/** Renders verse text, turning inline † markers into styled superscript daggers. */
function VerseText({ text }: { text: string }) {
  if (!text.includes(FOOTNOTE_MARKER)) {
    return <ThemedText style={styles.verseText}>{text}</ThemedText>;
  }

  const segments = text.split(FOOTNOTE_MARKER);
  return (
    <ThemedText style={styles.verseText}>
      {segments.map((segment, i) => (
        <Fragment key={i}>
          {segment}
          {i < segments.length - 1 ? (
            <ThemedText style={styles.inlineMarker}>{FOOTNOTE_MARKER}</ThemedText>
          ) : null}
        </Fragment>
      ))}
    </ThemedText>
  );
}

export function VerseList({ verses, lang, bookId, chapter, bookTitle }: VerseListProps) {
  const savedMap = useSavedVerseMap();
  const [selected, setSelected] = useState<VerseRecord | null>(null);

  const footnotes: Footnote[] = verses.flatMap((verse) => parseFootnotes(verse));

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
        return (
          <Pressable
            key={verse.verse}
            style={styles.row}
            delayLongPress={250}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              setSelected(verse);
            }}
            accessibilityRole="button"
            accessibilityHint="Press and hold to highlight or save this verse"
            accessibilityLabel={`${bookTitle} ${chapter}:${verse.verse}`}>
            <ThemedText style={styles.verseNum}>{verse.verse}</ThemedText>
            <View style={styles.verseBody}>
              <View
                style={[
                  styles.highlightWrap,
                  saved?.color ? { backgroundColor: saved.color } : null,
                  isSelected && styles.verseSelected,
                ]}>
                <VerseText text={pickVerseText(verse, lang)} />
              </View>
              {saved?.note ? (
                <View style={styles.noteRow}>
                  <Icon name="bookmark" size={12} color={Palette.gold} />
                  <ThemedText style={styles.noteText} numberOfLines={2}>
                    {saved.note}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}

      {footnotes.length > 0 ? (
        <View style={styles.footnotes}>
          <View style={styles.divider} />
          {footnotes.map((fn, i) => (
            <View key={`${fn.ref}-${i}`} style={styles.footnoteRow}>
              <ThemedText style={styles.footnoteMarker}>{FOOTNOTE_MARKER}</ThemedText>
              <ThemedText style={styles.footnoteText}>
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

const styles = StyleSheet.create({
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
    color: Palette.gold,
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
    borderColor: Palette.gold,
    paddingBottom: 2,
  },
  verseText: {
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
  },
  inlineMarker: {
    fontSize: 12,
    lineHeight: 28,
    color: Palette.gold,
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
    color: Palette.muted,
  },
  footnotes: {
    marginTop: Space.s24,
    gap: Space.s8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.mutedGold,
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
    color: Palette.gold,
    fontWeight: '700',
  },
  footnoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Palette.muted,
  },
  footnoteRef: {
    fontSize: 13,
    lineHeight: 20,
    color: Palette.gold,
    fontWeight: '600',
  },
});
