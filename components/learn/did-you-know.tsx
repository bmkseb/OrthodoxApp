import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ExploreCardSurface } from '@/components/explore/explore-card-chrome';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';
import { useTranslation } from '@/hooks/use-translation';

type CanonFact = {
  id: string;
  title: string;
  geez: string;
  fact: string;
  /** When false, the card is informational only (no navigation). */
  link: boolean;
};

const FACTS: CanonFact[] = [
  {
    id: 'enoch',
    title: 'The Book of Enoch',
    geez: 'መጽሐፈ ሄኖክ',
    fact: 'Quoted directly in the New Testament (Jude 1:14–15), yet it survives in full only in Ge\u02bbez.',
    link: false,
  },
  {
    id: 'jubilees',
    title: 'Jubilees',
    geez: 'መጽሐፈ ኩፋሌ',
    fact: 'Retells Genesis and Exodus as revealed to Moses, dividing history into 49-year "jubilees".',
    link: false,
  },
  {
    id: 'meqabyan',
    title: 'The Meqabyan',
    geez: 'መጽሐፈ መቃብያን',
    fact: 'Ethiopia\u2019s three Books of Meqabyan are entirely distinct from the Maccabees of other traditions.',
    link: true,
  },
];

export function DidYouKnow() {
  const { mode } = useTranslation();
  const { palette } = useThemeTokens();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        rail: {
          gap: Layout.cardGap,
          paddingRight: Layout.pagePadding,
        },
        card: {
          width: 240,
          padding: Space.s16,
          gap: Space.s4,
        },
        eyebrowRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Space.s4,
          marginBottom: Space.s4,
        },
        eyebrow: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.4,
          color: palette.gold,
        },
        title: {
          fontSize: 16,
          fontWeight: '700',
          color: palette.text,
        },
        geez: {
          fontSize: 13,
          color: palette.gold,
          marginBottom: Space.s4,
        },
        fact: {
          fontSize: 13,
          lineHeight: 19,
          color: palette.muted,
        },
      }),
    [palette]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}>
      {FACTS.map((item) => {
        const inner = (
          <>
            <View style={styles.eyebrowRow}>
              <Icon name="sparkle" size={13} color={palette.gold} />
              <ThemedText style={styles.eyebrow}>DID YOU KNOW?</ThemedText>
            </View>
            <ThemedText style={styles.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {mode !== 'en' ? (
              <ThemedText style={styles.geez} numberOfLines={1}>
                {item.geez}
              </ThemedText>
            ) : null}
            <ThemedText style={styles.fact} numberOfLines={4}>
              {item.fact}
            </ThemedText>
          </>
        );

        if (!item.link) {
          return (
            <ExploreCardSurface key={item.id} style={styles.card}>
              {inner}
            </ExploreCardSurface>
          );
        }
        return (
          <OrthodoxPressable
            key={item.id}
            onPress={() => router.push('/catalog')}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.fact}`}>
            <ExploreCardSurface style={styles.card}>{inner}</ExploreCardSurface>
          </OrthodoxPressable>
        );
      })}
    </ScrollView>
  );
}
