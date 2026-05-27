import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

type ShimmerProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Shimmer({ width = '100%', height = 16, borderRadius = 8, style }: ShimmerProps) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View style={[styles.shimmer, { borderRadius }, animatedStyle]} />
    </View>
  );
}

export function BookCardSkeleton() {
  return (
    <View style={skeletonStyles.bookCard}>
      <Shimmer width={60} height={88} borderRadius={8} />
      <View style={skeletonStyles.bookMeta}>
        <Shimmer width="70%" height={18} />
        <Shimmer width="50%" height={13} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={skeletonStyles.listItem}>
      <Shimmer width={48} height={48} borderRadius={8} />
      <View style={skeletonStyles.listMeta}>
        <Shimmer width="60%" height={15} />
        <Shimmer width="40%" height={13} />
      </View>
    </View>
  );
}

export function FeaturedHeroSkeleton() {
  return <Shimmer width="100%" height={200} borderRadius={16} />;
}

const styles = StyleSheet.create({
  shimmer: {
    flex: 1,
    backgroundColor: 'rgba(201, 147, 58, 0.25)',
  },
});

const skeletonStyles = StyleSheet.create({
  bookCard: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  bookMeta: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  listMeta: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
});
