import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Palette, Space, Typography } from '@/constants/theme';
import { SacredImagery } from '@/constants/explore-content';
import { useTranslation } from '@/hooks/use-translation';

const CARD_BG = Palette.surface; // Closest existing token to spec's #1A1815
const CARD_BORDER = 'rgba(201, 147, 58, 0.15)';
const CARD_RADIUS = 20;
const CARD_PADDING = 16;
const CARD_HEIGHT = 160;
const GRID_GAP = 12;
const WATERMARK_GOLD = 'rgba(201, 147, 58, 0.06)';

type CardShellProps = {
  label: string;
  onPress?: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
};

function CardShell({ label, onPress, accessibilityLabel, children }: CardShellProps) {
  return (
    <OrthodoxPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.cardBody}>{children}</View>
    </OrthodoxPressable>
  );
}

/** Today's Devotion — 2x2 grid: Saint, Lectionary, Hymn, Reflection. */
export function TodaysDevotionGrid() {
  const { ethiopicStyle } = useTranslation();

  return (
    <View style={styles.wrap}>
      {/* Header with faint gold cross watermark */}
      <View style={styles.headerRow}>
        <Text style={styles.headerWatermark} pointerEvents="none" accessibilityElementsHidden>
          ☩
        </Text>
        <Text allowFontScaling={false} style={[styles.headerGeez, ethiopicStyle]}>
          ቅዱስ
        </Text>
        <Text allowFontScaling={false} style={styles.headerPipe}>
          |
        </Text>
        <ThemedText style={styles.headerEn}>Today&apos;s Devotion</ThemedText>
      </View>

      {/* 2x2 grid */}
      <View style={styles.gridRow}>
        <CardShell
          label="SAINT OF THE DAY"
          accessibilityLabel="Saint of the day: St. Tekle Haymanot">
          <View style={styles.saintAvatar}>
            <Text style={styles.saintGlyph} allowFontScaling={false}>
              ☩
            </Text>
          </View>
          <Text style={styles.cardCenterTitle}>St. Tekle Haymanot</Text>
        </CardShell>

        <CardShell label="LECTIONARY" accessibilityLabel="Lectionary: 3 readings today">
          <View style={styles.lectionaryStack}>
            <Icon name="sun" size={16} color={Palette.mutedGold} />
            <Icon name="cross" size={16} color={Palette.mutedGold} />
            <Icon name="moon" size={16} color={Palette.mutedGold} />
          </View>
          <Text style={styles.cardCenterTitle}>3 readings</Text>
        </CardShell>
      </View>

      <View style={styles.gridRow}>
        <CardShell
          label="HYMN OF THE DAY"
          accessibilityLabel="Hymn of the day: Covenant of Mercy by Helena Alemu">
          <Image
            source={{ uri: SacredImagery.listenHymns }}
            style={styles.hymnArt}
            accessibilityIgnoresInvertColors
          />
          <View style={styles.hymnTextWrap}>
            <Text style={styles.hymnTitle} numberOfLines={1}>
              Covenant of Mercy
            </Text>
            <Text style={styles.hymnArtist} numberOfLines={1}>
              Helena Alemu
            </Text>
          </View>
        </CardShell>

        <CardShell label="REFLECTION" accessibilityLabel="Reflection: On praise by St. Yared">
          <Text style={styles.reflectionGlyph} allowFontScaling={false}>
            ☩
          </Text>
          <Text style={styles.reflectionQuote}>On praise — St. Yared</Text>
        </CardShell>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: GRID_GAP,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s8,
    marginBottom: Space.s4,
    position: 'relative',
  },
  headerWatermark: {
    position: 'absolute',
    left: -Space.s8,
    top: -Space.s8,
    fontSize: 56,
    lineHeight: 56,
    color: WATERMARK_GOLD,
    fontWeight: '300',
  },
  headerGeez: {
    fontSize: 18,
    fontWeight: '500',
    color: Palette.gold,
    letterSpacing: 0.2,
  },
  headerPipe: {
    fontSize: 18,
    color: Palette.mutedGold,
    fontWeight: '300',
  },
  headerEn: {
    ...Typography.sectionTitle,
    fontSize: 20,
    color: Palette.text,
  },

  // Grid layout
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },

  // Shared card
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    backgroundColor: CARD_BG,
    borderRadius: CARD_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARD_BORDER,
    padding: CARD_PADDING,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.mutedGold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Space.s8,
  },
  cardCenterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
    textAlign: 'center',
  },

  // Saint card
  saintAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saintGlyph: {
    fontSize: 24,
    lineHeight: 26,
    color: Palette.gold,
    fontWeight: '300',
  },

  // Lectionary card
  lectionaryStack: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s4,
  },

  // Hymn card
  hymnArt: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Palette.card,
  },
  hymnTextWrap: {
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  hymnTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text,
    textAlign: 'center',
  },
  hymnArtist: {
    fontSize: 11,
    color: Palette.mutedGold,
    textAlign: 'center',
  },

  // Reflection card
  reflectionGlyph: {
    fontSize: 32,
    lineHeight: 36,
    color: Palette.gold,
    fontWeight: '300',
  },
  reflectionQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Palette.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});
