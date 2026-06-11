import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ListenFeaturedCard } from '@/components/listen/listen-featured-card';
import { ReadFeaturedCard } from '@/components/read/read-featured-card';
import { HolyBibleHeroCard } from '@/components/sacred/holy-bible-hero-card';
import type { ReadCoverFocus, ReadCoverSource, ReadCoverTone } from '@/constants/read-cover-art';
import { Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

export type FeaturedItem = {
  id: string;
  title: string;
  subtitle: string;
  badgeLabel?: string;
  imageUri?: ReadCoverSource;
  coverTone?: ReadCoverTone;
  coverFocus?: ReadCoverFocus;
  onPress?: () => void;
};

type FeaturedCarouselProps = {
  items: FeaturedItem[];
  /** Width of each page (matches the content width). */
  width: number;
  /** Auto-advance interval in ms. */
  autoRotateMs?: number;
  /** Overrides the default featured card height for a more compact slot. */
  cardHeight?: number;
  /** Listen tab — streaming hero with play control. */
  listenHero?: boolean;
  /** Read tab — premium book cover with title overlay. */
  readHero?: boolean;
};

// How long after a user interaction before auto-rotation resumes.
const RESUME_DELAY_MS = 2000;

export function FeaturedCarousel({
  items,
  width,
  autoRotateMs = 5000,
  cardHeight,
  listenHero = false,
  readHero = false,
}: FeaturedCarouselProps) {
  const { palette } = useThemeTokens();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dotStyles = useMemo(
    () =>
      StyleSheet.create({
        dot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: `${palette.gold}4D`,
        },
        dotActive: {
          width: 18,
          backgroundColor: palette.gold,
        },
      }),
    [palette.gold]
  );

  const setActive = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };

  const clearResume = () => {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  };

  const pause = () => {
    pausedRef.current = true;
    clearResume();
  };

  const scheduleResume = () => {
    clearResume();
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const next = (indexRef.current + 1) % items.length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setActive(next);
    }, autoRotateMs);
    return () => {
      clearInterval(id);
      clearResume();
    };
  }, [items.length, width, autoRotateMs]);

  const syncFromOffset = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1));
    setActive(Math.min(Math.max(i, 0), items.length - 1));
  };

  if (items.length === 0) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onTouchStart={pause}
        onScrollBeginDrag={pause}
        onScrollEndDrag={scheduleResume}
        onMomentumScrollEnd={(e) => {
          syncFromOffset(e);
          scheduleResume();
        }}>
        {items.map((item) => (
          <View key={item.id} style={{ width }}>
            {listenHero ? (
              <ListenFeaturedCard
                title={item.title}
                subtitle={item.subtitle}
                imageUri={typeof item.imageUri === 'string' ? item.imageUri : undefined}
                height={cardHeight}
                onPress={item.onPress}
                style={{ width }}
              />
            ) : readHero && item.imageUri != null ? (
              <ReadFeaturedCard
                title={item.title}
                subtitle={item.subtitle}
                eyebrow={item.badgeLabel ?? 'Featured'}
                coverSource={item.imageUri}
                coverTone={item.coverTone}
                coverFocus={item.coverFocus}
                height={cardHeight}
                onPress={item.onPress}
                style={{ width }}
              />
            ) : (
              <HolyBibleHeroCard
                eyebrow={item.badgeLabel ?? 'Featured'}
                title={item.title}
                subtitle={item.subtitle}
                onPress={item.onPress}
                width={width}
                height={cardHeight}
              />
            )}
          </View>
        ))}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, i) => (
            <View key={item.id} style={[dotStyles.dot, i === index && dotStyles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    marginTop: Space.s12,
  },
});
