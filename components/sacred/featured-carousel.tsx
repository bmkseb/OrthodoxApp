import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { EditorialFeaturedCard } from '@/components/sacred/editorial-featured-card';
import { Palette, Space } from '@/constants/theme';

export type FeaturedItem = {
  id: string;
  title: string;
  subtitle: string;
  badgeLabel?: string;
  imageUri?: string;
  onPress?: () => void;
};

type FeaturedCarouselProps = {
  items: FeaturedItem[];
  /** Width of each page (matches the content width). */
  width: number;
  /** Auto-advance interval in ms. */
  autoRotateMs?: number;
};

// How long after a user interaction before auto-rotation resumes.
const RESUME_DELAY_MS = 2000;

export function FeaturedCarousel({ items, width, autoRotateMs = 5000 }: FeaturedCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            <EditorialFeaturedCard
              title={item.title}
              subtitle={item.subtitle}
              badgeLabel={item.badgeLabel}
              imageUri={item.imageUri}
              onPress={item.onPress}
              style={{ width }}
            />
          </View>
        ))}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, i) => (
            <View key={item.id} style={[styles.dot, i === index && styles.dotActive]} />
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(201, 147, 58, 0.3)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Palette.gold,
  },
});
