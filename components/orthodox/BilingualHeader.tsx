import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';
import { useLanguage } from '@/contexts/language-context';

type BilingualHeaderProps = {
  /** Amharic / Ge'ez form (e.g. "ቃል"). Shown in `bilingual` and `amharic` modes. */
  amharic: string;
  /** English form (e.g. "Logos"). Shown in `english` and `bilingual` modes. */
  english: string;
  /** Font size for the header text. Defaults to 22 (section header). */
  size?: number;
  /** Font weight override. Defaults to '600'. */
  weight?: TextStyle['fontWeight'];
  /** Optional letter-spacing override. Defaults to 0. */
  letterSpacing?: number;
  /** Override the container style — e.g. to control margins. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Renders a header that responds to the global language mode:
 *  - `en`        → English only, parchment.
 *  - `bilingual` → "Amharic | English" (gold | faded pipe | parchment).
 *  - `am`        → Amharic only, gold.
 *
 * All headers across the app should funnel through this component so the
 * language sheet (globe icon → bottom sheet) can re-render them in unison.
 */
export function BilingualHeader({
  amharic,
  english,
  size = 22,
  weight = '600',
  letterSpacing = 0,
  style,
}: BilingualHeaderProps) {
  const { mode } = useLanguage();

  const lineHeight = Math.round(size * 1.25);
  const baseTextStyle: TextStyle = {
    fontSize: size,
    fontWeight: weight,
    lineHeight,
    letterSpacing,
  };

  if (mode === 'en') {
    return (
      <View style={[styles.row, style]}>
        <Text
          style={[baseTextStyle, styles.english]}
          numberOfLines={1}
          allowFontScaling={false}>
          {english}
        </Text>
      </View>
    );
  }

  if (mode === 'am') {
    return (
      <View style={[styles.row, style]}>
        <Text
          style={[baseTextStyle, styles.amharic]}
          numberOfLines={1}
          allowFontScaling={false}>
          {amharic}
        </Text>
      </View>
    );
  }

  // Default: bilingual — English first (parchment), Amharic a bit smaller beside it (gold).
  const accentSize = Math.max(12, Math.round(size * 0.62));
  const accentStyle: TextStyle = {
    fontSize: accentSize,
    fontWeight: weight,
    lineHeight: Math.round(accentSize * 1.25),
    letterSpacing: 0,
  };

  return (
    <View style={[styles.row, style]}>
      <Text
        style={[baseTextStyle, styles.english, styles.primaryText]}
        numberOfLines={1}
        allowFontScaling={false}>
        {english}
      </Text>
      <Text
        style={[accentStyle, styles.amharic, styles.accentText]}
        numberOfLines={1}
        allowFontScaling={false}>
        {amharic}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  amharic: { color: Palette.gold },
  english: { color: Palette.text },
  // English keeps its full size; Amharic accent truncates first if space runs out.
  primaryText: { flexShrink: 0 },
  accentText: { flexShrink: 1, minWidth: 0 },
});
