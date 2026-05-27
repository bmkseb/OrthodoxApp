import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { VignetteOverlay } from '@/components/ui/vignette-overlay';
import { BorderRadius, Opacity, Overlays, Palette, Space } from '@/constants/theme';

type EditorialReflectionCardProps = {
  label: string;
  title: string;
  excerpt: string;
  imageUri: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const EditorialReflectionCard = memo(function EditorialReflectionCard({
  label,
  title,
  excerpt,
  imageUri,
  onPress,
  style,
}: EditorialReflectionCardProps) {
  return (
    <OrthodoxPressable style={[styles.wrap, style]} onPress={onPress} accessibilityRole="button">
      <View style={styles.card}>
        <SacredImage uri={imageUri} style={styles.image} contentFit="cover" />
        <View style={styles.darken} />
        <VignetteOverlay />
        <ManuscriptCornerFrame inset={10} />
        <View style={styles.cornerIcon}>
          <Icon name="cross" size={16} color={`rgba(201, 147, 58, 0.5)`} />
        </View>
        <LinearGradient colors={[...Overlays.heroCinematic]} locations={[0, 0.45, 0.7, 1]} style={styles.gradient}>
          <View style={styles.labelCapsule}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText style={styles.excerpt} numberOfLines={2}>
            {excerpt}
          </ThemedText>
        </LinearGradient>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  card: {
    minHeight: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `rgba(201, 147, 58, ${Opacity.goldBorderSubtle})`,
    backgroundColor: '#141210',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  darken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 5, 0.35)',
  },
  cornerIcon: {
    position: 'absolute',
    top: Space.s12,
    right: Space.s12,
    zIndex: 3,
    opacity: 0.7,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Space.s16,
    paddingBottom: Space.s16,
    paddingTop: Space.s32,
  },
  labelCapsule: {
    alignSelf: 'flex-start',
    paddingHorizontal: Space.s12,
    paddingVertical: Space.s4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.22)',
    marginBottom: Space.s12,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.35,
    lineHeight: 28,
    marginBottom: Space.s8,
    maxWidth: '92%',
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(154, 146, 133, 0.95)',
    maxWidth: '88%',
  },
});
