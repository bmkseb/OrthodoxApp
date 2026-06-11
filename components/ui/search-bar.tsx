import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View, Keyboard } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Layout, Spacing, getTabChromeTokens } from '@/constants/theme';
import { useThemeTokens } from '@/hooks/use-theme-tokens';

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearchSubmit?: (term: string) => void;
  recentSearches?: string[];
  onRecentPress?: (term: string) => void;
  onRemoveRecent?: (term: string) => void;
  placeholderTextColor?: string;
  hideRecentChips?: boolean;
  onFocusChange?: (focused: boolean) => void;
};

export function SearchBar({
  placeholder = 'Search',
  value,
  onChangeText,
  onSearchSubmit,
  recentSearches,
  onRecentPress,
  onRemoveRecent,
  placeholderTextColor,
  hideRecentChips = false,
  onFocusChange,
}: SearchBarProps) {
  const { palette, colorScheme } = useThemeTokens();
  const chrome = useMemo(
    () => getTabChromeTokens(palette, colorScheme),
    [colorScheme, palette]
  );
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const query = value ?? internalValue;
  const showRecent = !hideRecentChips && isFocused && Boolean(recentSearches?.length) && !query.trim();
  const placeholderColor = placeholderTextColor ?? chrome.placeholder;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          height: Layout.searchBarHeight,
          paddingHorizontal: Spacing.md - 2,
          borderRadius: BorderRadius.lg,
          borderWidth: 1,
          borderColor: isFocused ? chrome.searchBorderFocused : chrome.searchBorder,
          backgroundColor: chrome.searchBackground,
          overflow: 'hidden',
        },
        input: {
          flex: 1,
          fontSize: 13,
          color: palette.text,
          paddingVertical: 0,
        },
        recentRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.sm,
          marginTop: Spacing.sm - 2,
        },
        recentChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs + 1,
          paddingHorizontal: Spacing.sm + 2,
          paddingVertical: Spacing.xs + 1,
          borderRadius: BorderRadius.full,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: chrome.chipBorder,
          backgroundColor: chrome.chipBackground,
        },
        recentChipLabel: {
          flexShrink: 1,
        },
        recentText: {
          fontSize: 11,
        },
      }),
    [chrome, isFocused, palette]
  );

  const applyTerm = (text: string) => {
    Keyboard.dismiss();
    setInternalValue(text);
    onChangeText?.(text);
    onSearchSubmit?.(text);
    onRecentPress?.(text);
  };

  const handleChange = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    Keyboard.dismiss();
    if (trimmed) {
      onSearchSubmit?.(trimmed);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        <Icon name="search" size={16} color={isFocused ? palette.gold : palette.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={query}
          onChangeText={handleChange}
          onFocus={() => {
            setIsFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onFocusChange?.(false);
          }}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />
        {query.length > 0 ? (
          <OrthodoxPressable onPress={() => handleChange('')} accessibilityLabel="Clear search">
            <Icon name="close" size={15} color={palette.muted} />
          </OrthodoxPressable>
        ) : null}
      </View>

      {showRecent ? (
        <View style={styles.recentRow}>
          {recentSearches!.map((term) => (
            <View key={term} style={styles.recentChip}>
              <OrthodoxPressable
                style={styles.recentChipLabel}
                onPress={() => applyTerm(term)}
                accessibilityRole="button"
                accessibilityLabel={`Search ${term}`}>
                <ThemedText type="muted" style={styles.recentText}>
                  {term}
                </ThemedText>
              </OrthodoxPressable>
              {onRemoveRecent ? (
                <OrthodoxPressable
                  hitSlop={8}
                  onPress={() => onRemoveRecent(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${term} from recent searches`}>
                  <Icon name="close" size={12} color={palette.muted} />
                </OrthodoxPressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
