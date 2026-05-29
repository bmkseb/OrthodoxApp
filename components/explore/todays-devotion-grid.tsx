import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BilingualHeader } from '@/components/orthodox/BilingualHeader';
import { Palette } from '@/constants/theme';
import { SacredImagery } from '@/constants/sacred-imagery';

const CARD_HEIGHT = 170;
const CARD_RADIUS = 16;
const CARD_PADDING = 12;
const CARD_GAP = 10;

const COLORS = {
  surface: '#1A1815',
  border: 'rgba(201, 147, 58, 0.15)',
  label: 'rgba(201, 147, 58, 0.55)', // muted gold for tiny labels
  parchment: Palette.text,
  mutedGold: '#8A8070',
};

type DevotionCardProps = {
  label: string;
  onPress?: () => void;
  children: React.ReactNode;
};

function DevotionCard({ label, onPress, children }: DevotionCardProps) {
  return (
    <OrthodoxPressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <Text style={styles.cardLabel} allowFontScaling={false}>
        {label}
      </Text>
      <View style={styles.cardBody}>{children}</View>
    </OrthodoxPressable>
  );
}

export function TodaysDevotionGrid() {
  return (
    <View>
      <BilingualHeader amharic="ቅዱስ" english="Today's Devotion" />
      <Text style={styles.subtitle} allowFontScaling={false}>
        Sacred touchpoints for today
      </Text>

      <View style={styles.row}>
        <DevotionCard
          label="SAINT"
          onPress={() => router.push('/(tabs)/calendar')}>
          <View style={styles.saintCircle}>
            <Text style={styles.saintCross} allowFontScaling={false}>
              ☩
            </Text>
          </View>
          <Text
            style={styles.cardTitle}
            numberOfLines={2}
            allowFontScaling={false}>
            St. Tekle Haymanot
          </Text>
        </DevotionCard>

        <DevotionCard
          label="LECTIONARY"
          onPress={() => router.push('/(tabs)/read')}>
          <View style={styles.lectionaryStack}>
            <Text style={styles.lectionaryCross} allowFontScaling={false}>
              ☩
            </Text>
            <Text style={styles.lectionaryCross} allowFontScaling={false}>
              ☩
            </Text>
            <Text style={styles.lectionaryCross} allowFontScaling={false}>
              ☩
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1} allowFontScaling={false}>
            3 readings
          </Text>
        </DevotionCard>

        <DevotionCard
          label="HYMN"
          onPress={() => router.push('/(tabs)/listen')}>
          <Image
            source={{ uri: SacredImagery.listenHymns }}
            style={styles.hymnArt}
            resizeMode="cover"
          />
          <Text style={styles.hymnTitle} numberOfLines={1} allowFontScaling={false}>
            Covenant of Mercy
          </Text>
          <Text style={styles.hymnArtist} numberOfLines={1} allowFontScaling={false}>
            Helena Alemu
          </Text>
        </DevotionCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
    color: COLORS.mutedGold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    padding: CARD_PADDING,
    borderRadius: CARD_RADIUS,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: COLORS.label,
    textTransform: 'uppercase',
  },
  cardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.parchment,
    textAlign: 'center',
    lineHeight: 16,
  },
  saintCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(201, 147, 58, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saintCross: {
    fontSize: 24,
    color: Palette.gold,
    lineHeight: 28,
  },
  lectionaryStack: {
    alignItems: 'center',
    gap: 1,
  },
  lectionaryCross: {
    fontSize: 12,
    color: Palette.gold,
    lineHeight: 14,
  },
  hymnArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 236, 215, 0.06)',
  },
  hymnTitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.parchment,
    textAlign: 'center',
    maxWidth: '100%',
  },
  hymnArtist: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.mutedGold,
    textAlign: 'center',
  },
});
