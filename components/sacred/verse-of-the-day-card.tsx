import { router } from 'expo-router';
import { memo, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptEdgeEyebrow } from '@/components/sacred/manuscript-edge-eyebrow';
import { ManuscriptEdgeFrame } from '@/components/sacred/manuscript-edge-frame';
import { Animation, SerifFamily, getManuscriptEdgeTokens } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { scriptureLangQuery, useScriptureLang } from '@/hooks/use-scripture-lang';

type DailyVerse = {
  reference: string;
  text: string;
  bookId: string;
  chapter: number;
};

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

const QUOTE_SIZE = 21.5;
const QUOTE_LINE = Math.round(QUOTE_SIZE * 1.4);

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
  hero?: boolean;
  /** Gold small-caps label above the card (Explore tab). */
  showEyebrow?: boolean;
  eyebrowLabel?: string;
  /** @deprecated Parent supplies ManuscriptEdgeFrame — use default chrome instead. */
  bare?: boolean;
};

export const VerseOfTheDayCard = memo(function VerseOfTheDayCard({
  width,
  hero = false,
  showEyebrow = false,
  eyebrowLabel = "Today's Verse",
  bare = false,
}: VerseOfTheDayCardProps) {
  const lang = useScriptureLang();
  const verse = getVerseOfTheDay();
  const { colorScheme } = useThemeTokens();
  const edge = getManuscriptEdgeTokens(colorScheme);
  const reduceMotion = useReducedMotion();
  const enterOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const enterLift = useSharedValue(reduceMotion ? 0 : Animation.verseEnterLift);

  useEffect(() => {
    if (reduceMotion) return;
    enterOpacity.value = withTiming(1, { duration: Animation.verseEnterMs });
    enterLift.value = withTiming(0, { duration: Animation.verseEnterMs });
  }, [enterLift, enterOpacity, reduceMotion]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
    transform: [{ translateY: enterLift.value }],
  }));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          paddingHorizontal: 20,
          paddingVertical: 18,
          gap: 12,
        },
        verse: {
          fontSize: hero ? QUOTE_SIZE : QUOTE_SIZE - 1,
          lineHeight: hero ? QUOTE_LINE : QUOTE_LINE - 1,
          color: edge.quoteText,
          fontFamily: SerifFamily,
          fontStyle: 'italic',
          textAlign: 'left',
        },
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        reference: {
          flex: 1,
          fontSize: 11,
          fontWeight: '600',
          color: edge.reference,
          letterSpacing: 0.6,
          fontFamily: SerifFamily,
          ...Platform.select({
            ios: { fontVariant: ['small-caps' as const] },
            default: { textTransform: 'uppercase' as const },
          }),
        },
      }),
    [edge, hero]
  );

  const verseContent = (
    <View style={styles.content}>
      <Text style={styles.verse}>{`\u201C${verse.text}\u201D`}</Text>
      <View style={styles.footer}>
        <Text style={styles.reference}>{verse.reference}</Text>
        <Icon name="arrow-right" size={16} color={edge.reference} />
      </View>
    </View>
  );

  const framedBody = bare ? verseContent : <ManuscriptEdgeFrame>{verseContent}</ManuscriptEdgeFrame>;

  const cardBody = (
    <>
      {showEyebrow ? <ManuscriptEdgeEyebrow label={eyebrowLabel} /> : null}
      {framedBody}
    </>
  );

  const pressable = (
    <OrthodoxPressable
      accessibilityRole="button"
      accessibilityLabel={`${verse.reference}. ${verse.text}`}
      onPress={() =>
        router.push(`/book/${verse.bookId}/${verse.chapter}${scriptureLangQuery(lang)}`)
      }
      style={width != null ? { width } : undefined}>
      {cardBody}
    </OrthodoxPressable>
  );

  if (!hero) {
    return pressable;
  }

  return <Animated.View style={enterStyle}>{pressable}</Animated.View>;
});
