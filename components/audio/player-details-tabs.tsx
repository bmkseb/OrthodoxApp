import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';

type DetailTab = 'lyrics' | 'about' | 'related';

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'lyrics', label: 'Lyrics / Text' },
  { key: 'about', label: 'About' },
  { key: 'related', label: 'Related' },
];

type PlayerDetailsTabsProps = {
  lyrics?: string;
  about?: string;
  related?: string;
};

export function PlayerDetailsTabs({ lyrics, about, related }: PlayerDetailsTabsProps) {
  const [active, setActive] = useState<DetailTab>('lyrics');

  const body =
    active === 'lyrics'
      ? lyrics ?? 'Sacred text for this recording will appear here when available.'
      : active === 'about'
        ? about ?? 'A brief introduction to this hymn, sermon, or chant from the Orthodox tradition.'
        : related ?? 'Related recordings and readings from your library will appear here.';

  return (
    <View style={styles.wrap}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <OrthodoxPressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActive(tab.key)}>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </OrthodoxPressable>
          );
        })}
      </View>
      <ThemedText style={styles.body}>{body}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: Space.s4,
    marginBottom: Space.s12,
    padding: Space.s4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tab: {
    flex: 1,
    paddingVertical: Space.s8,
    paddingHorizontal: Space.s4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
    borderColor: 'rgba(201, 147, 58, 0.2)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Palette.muted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Palette.gold,
    fontWeight: '600',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: Palette.text,
    opacity: 0.88,
    textAlign: 'center',
  },
});
