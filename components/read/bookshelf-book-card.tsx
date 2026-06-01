import React, { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';
import { ThemedText } from '@/components/themed-text';
import { SacredImage } from '@/components/ui/sacred-image';
import { Overlays, Palette, Space, Typography } from '@/constants/theme';

const BOOK_WIDTH = 96;
const BOOK_HEIGHT = 142;
const SPINE_WIDTH = 6;
const CORNER_RADIUS = 4;

type BookshelfBookCardProps = {
  title: string;
  subtitle?: string;
  imageUri: string;
  progress?: number;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
};

export const BookshelfBookCard = memo(function BookshelfBookCard({
  title,
  subtitle,
  imageUri,
  progress = 0,
  onPress,
  onRemove,
  removeLabel,
}: BookshelfBookCardProps) {
  const showProgress = progress > 0;
  const hasImage = !!imageUri;

  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <View style={styles.shadowHost}>
        <View style={styles.card}>
          {hasImage ? (
            <>
              <SacredImage uri={imageUri} style={[styles.image, { opacity: ManuscriptTokens.imageSoftening }]} />
              <LinearGradient
                colors={['rgba(46, 32, 18, 0.18)', 'rgba(20, 14, 9, 0.34)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </>
          ) : (
            <LinearGradient
              colors={['#2A2118', ManuscriptTokens.cardWarmEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, styles.placeholder]}>
              <Text style={styles.placeholderCross}>☩</Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['rgba(0, 0, 0, 0.58)', 'rgba(0, 0, 0, 0.22)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.spine}
          />

          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'transparent', 'rgba(255, 255, 255, 0.025)']}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shine}
            pointerEvents="none"
          />

          <LinearGradient
            colors={[...Overlays.heroBottomStrong]}
            locations={[0, 0.55, 1]}
            style={styles.gradient}>
            <Text style={styles.cross}>☩</Text>
            <ThemedText style={styles.title} numberOfLines={2}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </ThemedText>
            ) : null}
          </LinearGradient>

          {showProgress ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]} />
            </View>
          ) : null}

          {onRemove ? (
            <OrthodoxPressable
              style={styles.removeBtn}
              onPress={onRemove}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={removeLabel ?? 'Remove'}>
              <Icon name="close" size={10} color={Palette.text} />
            </OrthodoxPressable>
          ) : null}
        </View>
      </View>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  wrap: {},
  shadowHost: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 3 },
        shadowOpacity: 0.45,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  card: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    overflow: 'hidden',
    backgroundColor: ManuscriptTokens.cardWarmEnd,
    borderTopRightRadius: CORNER_RADIUS,
    borderBottomRightRadius: CORNER_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 0,
    borderColor: 'rgba(201, 147, 58, 0.15)',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCross: {
    color: 'rgba(201, 147, 58, 0.4)',
    fontSize: 30,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SPINE_WIDTH,
    zIndex: 2,
  },
  shine: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Space.s8,
    paddingBottom: Space.s8,
    paddingTop: Space.s12,
    zIndex: 4,
  },
  cross: {
    color: Palette.muted,
    fontSize: 10,
    marginBottom: 2,
    opacity: 0.65,
  },
  title: {
    ...Typography.cardTitle,
    fontSize: 13,
    lineHeight: 16,
    color: Palette.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.15,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ManuscriptTokens.progressGlow,
  },
  removeBtn: {
    position: 'absolute',
    top: Space.s4,
    right: Space.s4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 10, 8, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.45)',
    zIndex: 6,
    elevation: 6,
  },
});
