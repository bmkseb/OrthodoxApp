import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { SacredImagery } from '@/constants/sacred-imagery';
import { Layout, Palette, Space, Typography } from '@/constants/theme';

type EditorialFeaturedCardProps = {
  title: string;
  subtitle: string;
  badgeLabel?: string;
  category?: string;
  imageUri?: string;
  /** Overrides the default card height (232) for a more compact featured slot. */
  height?: number;
  onPress?: () => void;
  style?: { width?: number; marginBottom?: number };
};

export const EditorialFeaturedCard = memo(function EditorialFeaturedCard({
  title,
  subtitle,
  badgeLabel,
  category,
  imageUri = SacredImagery.readFeatured,
  height,
  onPress,
  style,
}: EditorialFeaturedCardProps) {
  const label = badgeLabel ?? category ?? 'Sacred Text';

  const content = (
    <View style={[styles.card, height != null && { height }, style]}>
      <View style={styles.bgLayer}>
        <Image source={{ uri: imageUri }} style={styles.bgImage} contentFit="cover" cachePolicy="memory-disk" />
        {Platform.OS === 'ios' ? (
          <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <LinearGradient
          colors={['rgba(40, 28, 16, 0.35)', 'rgba(12, 10, 8, 0.88)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.fgFrame}>
        <Image source={{ uri: imageUri }} style={styles.fgImage} contentFit="cover" cachePolicy="memory-disk" transition={180} />
        <LinearGradient
          colors={['transparent', 'rgba(12, 10, 8, 0.35)', 'rgba(0, 0, 0, 0.82)']}
          locations={[0.15, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.textLayer}>
        <Text style={styles.category}>{label.toUpperCase()}</Text>
        <Text style={styles.cross}>☩</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  if (onPress) return <OrthodoxPressable onPress={onPress}>{content}</OrthodoxPressable>;
  return content;
});

const styles = StyleSheet.create({
  card: {
    height: 232,
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.border,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.06 }],
  },
  bgImage: {
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  fgFrame: {
    ...StyleSheet.absoluteFillObject,
    margin: Space.s12,
    marginBottom: 0,
    borderTopLeftRadius: Space.s12,
    borderTopRightRadius: Space.s12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.12)',
  },
  fgImage: {
    width: '100%',
    height: '100%',
  },
  textLayer: {
    position: 'absolute',
    left: Space.s24,
    right: Space.s24,
    bottom: Space.s24,
    zIndex: 3,
    gap: Space.s8,
  },
  category: {
    ...Typography.metadata,
    color: Palette.muted,
  },
  cross: {
    fontSize: 13,
    color: Palette.muted,
    opacity: 0.75,
  },
  title: {
    ...Typography.sectionTitle,
    fontSize: 22,
    color: Palette.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(245, 236, 215, 0.72)',
    fontStyle: 'italic',
  },
});
