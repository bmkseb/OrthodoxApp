import React, { memo, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { PremiumBookCoverLayers } from '@/components/read/premium-book-cover-layers';
import type { ReadCoverFocus, ReadCoverSource, ReadCoverTone } from '@/constants/read-cover-art';
import { SerifFamily, Space } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

const BOOK_WIDTH = 96;
const BOOK_HEIGHT = 142;
const SPINE_WIDTH = 6;
const CORNER_RADIUS = 4;

export type CoverVariant = 0 | 1 | 2;

type BookshelfBookCardProps = {
  title: string;
  subtitle?: string;
  /** Bundled asset or remote URL — rendered with premium gloss treatment. */
  imageUri?: ReadCoverSource;
  coverTone?: ReadCoverTone;
  coverFocus?: ReadCoverFocus;
  /** Title/subtitle over photo covers (default on). */
  showTitleOverlay?: boolean;
  progress?: number;
  /** Used when no cover photo is supplied. */
  coverVariant?: CoverVariant;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
};

export const BookshelfBookCard = memo(function BookshelfBookCard({
  title,
  subtitle,
  imageUri,
  coverTone = 'default',
  coverFocus,
  showTitleOverlay = true,
  progress = 0,
  coverVariant = 0,
  onPress,
  onRemove,
  removeLabel,
}: BookshelfBookCardProps) {
  const { palette, sacred } = useThemeTokens();
  const showProgress = progress > 0;
  const hasPhotoCover = imageUri != null && imageUri !== '';

  const coverColors = useMemo(() => {
    const variants = [
      [sacred.coverEspresso, '#1C1610'],
      [sacred.coverForest, '#152019'],
      [sacred.coverOxblood, '#351A1C'],
    ] as const;
    return variants[coverVariant % 3];
  }, [coverVariant, sacred]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {},
        shadowHost: {
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 4, height: 3 },
              shadowOpacity: 0.45,
              shadowRadius: 6,
            },
            android: { elevation: 6 },
          }),
        },
        card: {
          width: BOOK_WIDTH,
          height: BOOK_HEIGHT,
          overflow: 'hidden',
          borderTopRightRadius: CORNER_RADIUS,
          borderBottomRightRadius: CORNER_RADIUS,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${palette.gold}33`,
        },
        topRule: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: palette.gold,
          zIndex: 6,
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
        titleScrim: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 4,
        },
        labels: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: Space.s8,
          paddingBottom: Space.s8,
          paddingTop: Space.s24,
          zIndex: 5,
        },
        gradient: {
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: Space.s8,
          paddingBottom: Space.s8,
          paddingTop: Space.s12,
          zIndex: 4,
        },
        title: {
          fontSize: 13,
          lineHeight: 16,
          fontWeight: '700',
          color: sacred.cream,
          fontFamily: SerifFamily,
        },
        subtitle: {
          marginTop: 2,
          fontSize: 10,
          lineHeight: 13,
          letterSpacing: 0.15,
          color: sacred.creamMuted,
          fontFamily: SerifFamily,
        },
        progressTrack: {
          height: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          zIndex: 6,
        },
        progressFill: {
          height: '100%',
          backgroundColor: palette.gold,
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
          borderColor: palette.border,
          zIndex: 7,
          elevation: 6,
        },
      }),
    [palette, sacred]
  );

  const titleBlock = (
    <>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </>
  );

  return (
    <OrthodoxPressable style={styles.wrap} onPress={onPress} accessibilityRole="button">
      <View style={styles.shadowHost}>
        <View style={styles.card}>
          <View style={styles.topRule} />

          {hasPhotoCover ? (
            <>
              <PremiumBookCoverLayers
                source={imageUri}
                spineWidth={SPINE_WIDTH}
                tone={coverTone}
                focus={coverFocus}
                recyclingKey={typeof imageUri === 'string' ? imageUri : title}
              />
              {showTitleOverlay ? (
                <>
                  <LinearGradient
                    colors={['transparent', 'rgba(8, 6, 5, 0.42)', 'rgba(8, 6, 5, 0.78)']}
                    locations={[0.35, 0.72, 1]}
                    style={styles.titleScrim}
                    pointerEvents="none"
                  />
                  <View style={[styles.labels, showProgress ? { paddingBottom: Space.s10 } : null]}>
                    {titleBlock}
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <>
              <LinearGradient
                colors={[coverColors[0], coverColors[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
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
              <View style={styles.gradient}>{titleBlock}</View>
            </>
          )}

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
              <Icon name="close" size={10} color={sacred.cream} />
            </OrthodoxPressable>
          ) : null}
        </View>
      </View>
    </OrthodoxPressable>
  );
});
