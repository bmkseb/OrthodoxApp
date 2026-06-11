import { StyleSheet, Text, View } from 'react-native';

import { ManuscriptCornerFrame } from '@/components/sacred/manuscript-corner-frame';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type DailyTeachingScriptureCardProps = {
  label: string;
  text: string;
  reference: string;
};

export function DailyTeachingScriptureCard({
  label,
  text,
  reference,
}: DailyTeachingScriptureCardProps) {
  return (
    <RadialCardSurface tint="warm" style={styles.card}>
      <ManuscriptCornerFrame />
      <View style={styles.inner}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text}>{`\u201C${text}\u201D`}</Text>
        <Text style={styles.reference}>{reference}</Text>
      </View>
    </RadialCardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.24)',
    marginBottom: Space.s24,
  },
  inner: {
    padding: Space.s16,
    paddingLeft: Space.s16,
    borderLeftWidth: 2,
    borderLeftColor: Palette.gold,
    margin: Space.s4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Palette.mutedGold,
    marginBottom: Space.s12,
  },
  text: {
    fontSize: 17,
    lineHeight: 28,
    fontStyle: 'italic',
    color: 'rgba(244, 236, 216, 0.92)',
  },
  reference: {
    marginTop: Space.s12,
    fontSize: 13,
    fontWeight: '700',
    color: Palette.gold,
    letterSpacing: 0.3,
  },
});
