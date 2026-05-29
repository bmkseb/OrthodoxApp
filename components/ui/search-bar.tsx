import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Palette, Spacing } from '@/constants/theme';

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  recentSearches?: string[];
  onRecentPress?: (term: string) => void;
  /** Override the placeholder text colour. Defaults to `Palette.muted`. */
  placeholderTextColor?: string;
};

export function SearchBar({
  placeholder = 'Search',
  value,
  onChangeText,
  recentSearches,
  onRecentPress,
  placeholderTextColor = Palette.muted,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const query = value ?? internalValue;
  const showRecent = recentSearches?.length && !query;

  const handleChange = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.innerShadow} pointerEvents="none" />
        <Icon name="search" size={16} color={Palette.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />
        {query.length > 0 ? (
          <OrthodoxPressable onPress={() => handleChange('')} accessibilityLabel="Clear search">
            <Icon name="close" size={15} color={Palette.muted} />
          </OrthodoxPressable>
        ) : null}
      </View>

      {showRecent ? (
        <View style={styles.recentRow}>
          {recentSearches!.map((term) => (
            <OrthodoxPressable
              key={term}
              style={styles.recentChip}
              onPress={() => {
                handleChange(term);
                onRecentPress?.(term);
              }}>
              <ThemedText type="muted" style={styles.recentText}>
                {term}
              </ThemedText>
            </OrthodoxPressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: Layout.searchBarHeight,
    paddingHorizontal: Spacing.md - 2,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Palette.card,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.35)' },
    }),
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: Palette.text,
    paddingVertical: 0,
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm - 2,
  },
  recentChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Layout.cardBorder,
    backgroundColor: 'rgba(30, 26, 20, 0.6)',
  },
  recentText: {
    fontSize: 11,
  },
});
