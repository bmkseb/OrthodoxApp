import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Palette, Space } from '@/constants/theme';

type DetailTab = 'lyrics' | 'about';

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'lyrics', label: 'Lyrics / Text' },
  { key: 'about', label: 'About' },
];

type PlayerDetailsTabsProps = {
  lyrics?: string;
  about?: string;
  aboutLoading?: boolean;
};

export function PlayerDetailsTabs({ lyrics, about, aboutLoading }: PlayerDetailsTabsProps) {
  const [active, setActive] = useState<DetailTab>('lyrics');

  const body =
    active === 'lyrics'
      ? lyrics ?? 'Sacred text for this recording will appear here when available.'
      : aboutLoading
        ? null
        : about ?? 'No description is available for this recording.';

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
      {active === 'about' && aboutLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Palette.gold} />
        </View>
      ) : (
        <ThemedText style={[styles.body, active === 'about' && styles.aboutBody]}>{body}</ThemedText>
      )}
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
  aboutBody: {
    textAlign: 'left',
  },
  loadingRow: {
    paddingVertical: Space.s16,
    alignItems: 'center',
  },
});
