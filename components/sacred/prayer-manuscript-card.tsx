import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { BorderRadius } from '@/constants/theme';

type PrayerManuscriptCardProps = {
  title: string;
  imageUri: string;
  onPress?: () => void;
};

export const PrayerManuscriptCard = memo(function PrayerManuscriptCard({
  title,
  imageUri,
  onPress,
}: PrayerManuscriptCardProps) {
  const content = (
    <View style={styles.outer}>
      <View style={styles.frame}>
        <View style={styles.image}>
          <SacredImage uri={imageUri} style={StyleSheet.absoluteFill} />
          <View style={styles.parchmentWash} pointerEvents="none" />
          <View style={styles.grain} pointerEvents="none" />
          <LinearGradient
            colors={['rgba(30, 22, 14, 0.12)', 'rgba(12, 9, 7, 0.55)', 'rgba(8, 6, 5, 0.88)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <ManuscriptCornerFrame inset={8} opacity={0.25} />
          <Text style={styles.cornerCross} pointerEvents="none">
            ☩
          </Text>
          <View style={styles.titleBlock}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {title}
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  if (onPress) return <OrthodoxPressable onPress={onPress}>{content}</OrthodoxPressable>;
  return content;
});

const styles = StyleSheet.create({
  outer: {
    width: 148,
    height: 176,
  },
  frame: {
    flex: 1,
    padding: 3,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: ManuscriptTokens.goldBorder,
    backgroundColor: 'rgba(201, 147, 58, 0.04)',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: BorderRadius.lg - 2,
    overflow: 'hidden',
  },
  parchmentWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ManuscriptTokens.parchmentWash,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ManuscriptTokens.parchmentGrain,
  },
  cornerCross: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 11,
    color: 'rgba(201, 147, 58, 0.2)',
  },
  titleBlock: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 32,
    zIndex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(245, 236, 215, 0.92)',
    letterSpacing: 0.15,
    lineHeight: 19,
  },
});
