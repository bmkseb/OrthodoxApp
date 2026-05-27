import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BorderRadius, Layout, Palette } from '@/constants/theme';

type LearnHeroCardProps = {
  title: string;
  subtitle: string;
  imageUri?: string;
  onPress?: () => void;
  style?: { width?: number; marginBottom?: number };
};

const DEFAULT_IMAGE = 'https://picsum.photos/900/520?random=learn-hero';

export function LearnHeroCard({
  title,
  subtitle,
  imageUri = DEFAULT_IMAGE,
  onPress,
  style,
}: LearnHeroCardProps) {
  const content = (
    <View style={[styles.card, style]}>
      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.82)', 'rgba(0,0,0,0.96)']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.cornerCross} pointerEvents="none">
        ☩
      </Text>
      <View style={styles.textBlock}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );

  if (onPress) return <OrthodoxPressable onPress={onPress}>{content}</OrthodoxPressable>;
  return content;
}

const styles = StyleSheet.create({
  card: {
    height: 228,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.22)',
    backgroundColor: Palette.card,
    ...Platform.select({
      ios: {
        shadowColor: Palette.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cornerCross: {
    position: 'absolute',
    top: 16,
    right: 18,
    fontSize: 20,
    color: Palette.gold,
    opacity: 0.08,
  },
  textBlock: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    gap: 10,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.6,
    color: 'rgba(245, 236, 215, 0.55)',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
});
