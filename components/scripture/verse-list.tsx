import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Palette } from '@/constants/theme';
import { pickVerseText } from '@/lib/scripture';
import type { ScriptureLang, VerseRecord } from '@/types/scripture';

type VerseListProps = {
  verses: VerseRecord[];
  lang: ScriptureLang;
};

export function VerseList({ verses, lang }: VerseListProps) {
  return (
    <View style={styles.list}>
      {verses.map((verse) => (
        <View key={verse.verse} style={styles.row}>
          <ThemedText style={styles.verseNum}>{verse.verse}</ThemedText>
          <ThemedText style={styles.verseText}>{pickVerseText(verse, lang)}</ThemedText>
        </View>
      ))}
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
});
