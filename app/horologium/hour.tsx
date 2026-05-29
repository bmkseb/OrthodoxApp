// app/horologium/[hour].tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScriptureBookHeader } from '@/components/scripture/scripture-book-header';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';
import { getHourById } from '@/data/horologium';
import { fetchChapterVerses } from '@/lib/scripture';
import { useScriptureLang } from '@/hooks/use-scripture-lang';
import { pickVerseText } from '@/lib/scripture';
import type { VerseRecord } from '@/types/scripture';

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionLine} />
      <ThemedText style={styles.sectionLabel}>{label}</ThemedText>
      <View style={styles.sectionLine} />
    </View>
  );
}

function PrayerBlock({ lines }: { lines: string[] }) {
  return (
    <View style={styles.prayerBlock}>
      {lines.map((line, i) => (
        <ThemedText key={i} style={styles.prayerText}>{line}</ThemedText>
      ))}
    </View>
  );
}

function PsalmItem({ num, note }: { num: number; note: string }) {
  return (
    <View style={styles.psalmRow}>
      <View style={styles.psalmNumBox}>
        <ThemedText style={styles.psalmNum}>{num}</ThemedText>
      </View>
      <View style={styles.psalmInfo}>
        <ThemedText style={styles.psalmTitle}>Psalm {num}</ThemedText>
        <ThemedText type="muted" style={styles.psalmNote}>{note}</ThemedText>
      </View>
    </View>
  );
}

export default function HourDetailScreen() {
  const { hour: hourId } = useLocalSearchParams<{ hour: string }>();
  const lang = useScriptureLang();
  const hour = hourId ? getHourById(hourId) : undefined;

  const [verses, setVerses] = useState<VerseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hour) return;
    setLoading(true);
    fetchChapterVerses(hour.scriptureReading.bookId, hour.scriptureReading.chapter)
      .then(setVerses)
      .catch(() => setVerses([]))
      .finally(() => setLoading(false));
  }, [hour]);

  if (!hour) {
    return (
      <ScreenScrollView includeFloatingChrome={false}>
        <ScriptureBackBar />
        <ThemedText>Hour not found.</ThemedText>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar />
      <ScriptureBookHeader
        title={hour.nameEnglish}
        subtitle={`${hour.nameGeez} · ${hour.timeLabel}`}
      />

      {/* Intention */}
      <View style={styles.intentionCard}>
        <ThemedText style={styles.intentionLabel}>Intention</ThemedText>
        <ThemedText style={styles.intentionText}>{hour.intention}</ThemedText>
      </View>

      {/* Description */}
      <ThemedText type="muted" style={styles.description}>
        {hour.description}
      </ThemedText>

      {/* Opening Prayers */}
      <SectionLabel label="Opening Prayers" />
      <PrayerBlock lines={hour.openingPrayers} />

      {/* Psalms */}
      <SectionLabel label="Psalms" />
      <View style={styles.psalmsBlock}>
        {hour.psalms.map((p) => (
          <PsalmItem key={p.number} num={p.number} note={p.note} />
        ))}
      </View>

      {/* Scripture Reading */}
      <SectionLabel label={`Scripture Reading · ${hour.scriptureReading.reference}`} />
      <ThemedText type="muted" style={styles.readingNote}>
        {hour.scriptureReading.note}
      </ThemedText>

      {loading ? (
        <ActivityIndicator color={Palette.gold} style={{ marginVertical: Spacing.lg }} />
      ) : (
        <View style={styles.versesBlock}>
          {verses.slice(0, 18).map((v) => (
            <View key={v.verse_id} style={styles.verseRow}>
              <ThemedText style={styles.verseNum}>{v.verse}</ThemedText>
              <ThemedText style={styles.verseText}>
                {pickVerseText(v, lang)}
              </ThemedText>
            </View>
          ))}
          {verses.length > 18 && (
            <ThemedText type="muted" style={styles.moreVerses}>
              … continue reading in the Bible
            </ThemedText>
          )}
        </View>
      )}

      {/* Intercessions */}
      <SectionLabel label="Intercessions" />
      <View style={styles.prayerBlock}>
        {hour.intercessions.map((line, i) => (
          <ThemedText key={i} style={styles.intercessionText}>
            {'✦  '}{line}
          </ThemedText>
        ))}
      </View>

      {/* Closing Prayer */}
      <SectionLabel label="Closing Prayer" />
      <View style={[styles.prayerBlock, styles.closingBlock]}>
        <ThemedText style={styles.closingText}>{hour.closingPrayer}</ThemedText>
      </View>

      <View style={{ height: Spacing.xl * 2 }} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  intentionCard: {
    marginHorizontal: Layout.pagePadding,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: Palette.gold,
    backgroundColor: Palette.card,
  },
  intentionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.gold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  intentionText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  description: {
    marginHorizontal: Layout.pagePadding,
    marginBottom: Spacing.lg,
    lineHeight: 22,
    fontSize: 14,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.pagePadding,
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.gold,
    opacity: 0.3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.gold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  prayerBlock: {
    marginHorizontal: Layout.pagePadding,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 24,
  },
  psalmsBlock: {
    marginHorizontal: Layout.pagePadding,
    gap: 8,
  },
  psalmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Layout.cardBorder,
  },
  psalmNumBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.gold,
  },
  psalmNum: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.gold,
  },
  psalmInfo: { flex: 1 },
  psalmTitle: { fontSize: 14, fontWeight: '600' },
  psalmNote: { fontSize: 12, lineHeight: 16 },
  readingNote: {
    marginHorizontal: Layout.pagePadding,
    marginBottom: Spacing.sm,
    fontSize: 13,
    fontStyle: 'italic',
  },
  versesBlock: {
    marginHorizontal: Layout.pagePadding,
    gap: 10,
  },
  verseRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  verseNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.gold,
    width: 24,
    marginTop: 2,
  },
  verseText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
  moreVerses: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  intercessionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  closingBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.gold,
  },
  closingText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
