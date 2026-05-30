import { router } from 'expo-router';
import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ParchmentGrainOverlay } from '@/components/sacred/parchment-grain-overlay';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';
import { scriptureLangQuery, useScriptureLang } from '@/hooks/use-scripture-lang';

type DailyVerse = {
  reference: string;
  text: string;
  bookId: string;
  chapter: number;
};

/** Small curated rotation so the card shows fresh spiritual content each day. */
const DAILY_VERSES: DailyVerse[] = [
  {
    reference: 'John 3:16',
    text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
    bookId: 'john',
    chapter: 3,
  },
  {
    reference: 'Psalm 23:1',
    text: 'The Lord is my shepherd; I shall lack nothing.',
    bookId: 'psalms',
    chapter: 23,
  },
  {
    reference: 'Proverbs 3:5',
    text: 'Trust in the Lord with all your heart, and don\u2019t lean on your own understanding.',
    bookId: 'proverbs',
    chapter: 3,
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ, who strengthens me.',
    bookId: 'philippians',
    chapter: 4,
  },
  {
    reference: 'Isaiah 40:31',
    text: 'But those who wait for the Lord will renew their strength. They will mount up with wings like eagles.',
    bookId: 'isaiah',
    chapter: 40,
  },
  {
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest.',
    bookId: 'matthew',
    chapter: 11,
  },
  {
    reference: 'Psalm 46:10',
    text: 'Be still, and know that I am God.',
    bookId: 'psalms',
    chapter: 46,
  },
  {
    reference: 'Romans 8:28',
    text: 'We know that all things work together for good for those who love God, for those who are called according to his purpose.',
    bookId: 'romans',
    chapter: 8,
  },
  {
    reference: 'Joshua 1:9',
    text: 'Be strong and courageous. Don\u2019t be afraid. Don\u2019t be dismayed, for the Lord your God is with you wherever you go.',
    bookId: 'joshua',
    chapter: 1,
  },
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace, and not of evil, to give you hope and a future.',
    bookId: 'jeremiah',
    chapter: 29,
  },
];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function getVerseOfTheDay(): DailyVerse {
  const index = dayOfYear(new Date()) % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

type VerseOfTheDayCardProps = {
  width?: number;
};

export const VerseOfTheDayCard = memo(function VerseOfTheDayCard({
  width,
}: VerseOfTheDayCardProps) {
  const lang = useScriptureLang();
  const verse = getVerseOfTheDay();

  return (
    <OrthodoxPressable
      accessibilityRole="button"
      accessibilityLabel={`${verse.reference}. ${verse.text}`}
      onPress={() =>
        router.push(`/book/${verse.bookId}/${verse.chapter}${scriptureLangQuery(lang)}`)
      }
      style={width != null ? { width } : undefined}>
      <RadialCardSurface tint="warm" style={styles.card}>
        <ParchmentGrainOverlay />
        <Text style={styles.watermark}>{'\u201C'}</Text>
        <ManuscriptCornerFrame inset={8} opacity={0.24} />

        <ThemedText style={styles.verse}>{`\u201C${verse.text}\u201D`}</ThemedText>

        <View style={styles.footer}>
          <ThemedText style={styles.reference}>{verse.reference}</ThemedText>
          <Icon name="chevron-right" size={16} color={Palette.gold} />
        </View>
      </RadialCardSurface>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.28)',
    paddingHorizontal: Space.s24,
    paddingVertical: Space.s24,
    gap: Space.s12,
  },
  watermark: {
    position: 'absolute',
    top: -18,
    right: 14,
    fontSize: 120,
    lineHeight: 120,
    color: Palette.gold,
    opacity: 0.08,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  verse: {
    fontSize: 19,
    lineHeight: 28,
    color: Palette.text,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.s4,
  },
  reference: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.gold,
    letterSpacing: 0.3,
  },
});
