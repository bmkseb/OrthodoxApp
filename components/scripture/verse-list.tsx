import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';
import { parseFootnotes, pickVerseText } from '@/lib/scripture';
import type { Footnote, ScriptureLang, VerseRecord } from '@/types/scripture';

const FOOTNOTE_MARKER = '\u2020'; // †

type VerseListProps = {
  verses: VerseRecord[];
  lang: ScriptureLang;
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

export function VerseList({ verses, lang }: VerseListProps) {
  const footnotes: Footnote[] = verses.flatMap((verse) => parseFootnotes(verse));

  return (
    <View style={styles.list}>
      {verses.map((verse) => (
        <View key={verse.verse} style={styles.row}>
          <ThemedText style={styles.verseNum}>{verse.verse}</ThemedText>
          <VerseText text={pickVerseText(verse, lang)} />
        </View>
      ))}

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
  verseText: {
    flex: 1,
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
