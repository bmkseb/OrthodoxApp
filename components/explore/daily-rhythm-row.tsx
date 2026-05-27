import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/hooks/use-translation';
import { Layout, Palette, Space, Typography } from '@/constants/theme';
import type { TranslationKey } from '@/lib/translations';

const ITEMS: { key: 'morningPrayer' | 'dailyReading' | 'eveningHymns'; subKey: string; icon: IconName }[] = [
  { key: 'morningPrayer', subKey: 'morningPrayerSub', icon: 'sun' },
  { key: 'dailyReading', subKey: 'dailyReadingSub', icon: 'book' },
  { key: 'eveningHymns', subKey: 'eveningHymnsSub', icon: 'music' },
];

/** Sacred quick-access liturgical rhythm — unified glass module. */
export function DailyRhythmRow() {
  const { t } = useTranslation();

  return (
    <View style={styles.shell}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.glass} />
      <View style={styles.header}>
        <Text style={styles.headerLabel}>{t('explore.dailyRhythm')}</Text>
      </View>
      <View style={styles.container}>
        {ITEMS.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <View style={styles.item}>
              <View style={styles.iconRing}>
                <Icon name={item.icon} size={15} color={Palette.mutedGold} />
              </View>
              <View style={styles.copy}>
                <ThemedText style={styles.label} numberOfLines={1}>
                  {t(`explore.${item.key}`)}
                </ThemedText>
                <ThemedText style={styles.sub} numberOfLines={1}>
                  {t(`explore.${item.subKey}` as TranslationKey)}
                </ThemedText>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
    marginTop: Space.s8,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 22, 16, 0.78)',
  },
  header: {
    paddingHorizontal: Space.s16,
    paddingTop: Space.s12,
    paddingBottom: Space.s4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLabel: {
    ...Typography.metadata,
    color: Palette.muted,
    fontSize: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: Space.s12,
    paddingHorizontal: Space.s8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: Space.s8,
    minWidth: 0,
    paddingHorizontal: Space.s4,
  },
  iconRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorderThin,
  },
  copy: {
    alignItems: 'center',
    gap: Space.s4,
    minWidth: 0,
  },
  label: {
    ...Typography.body,
    fontSize: 12,
    fontWeight: '600',
    color: Palette.text,
    textAlign: 'center',
  },
  sub: {
    ...Typography.metadata,
    fontSize: 9,
    color: Palette.muted,
    textAlign: 'center',
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: Space.s4,
  },
});
