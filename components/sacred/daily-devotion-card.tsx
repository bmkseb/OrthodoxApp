import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { RadialCardSurface } from '@/components/sacred/radial-card-surface';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type DailyDevotionCardProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  width?: number;
};

export const DailyDevotionCard = memo(function DailyDevotionCard({
  icon,
  title,
  subtitle,
  onPress,
  width,
}: DailyDevotionCardProps) {
  return (
    <OrthodoxPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={width != null ? { width } : undefined}>
      <RadialCardSurface tint="warm" style={styles.card}>
        <View style={styles.iconBadge}>
          <Icon name={icon} size={20} color={Palette.gold} />
        </View>
        <View style={styles.text}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
          <ThemedText type="muted" style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        </View>
      </RadialCardSurface>
    </OrthodoxPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: 116,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.22)',
    padding: Space.s16,
    justifyContent: 'space-between',
    gap: Space.s12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 147, 58, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(201, 147, 58, 0.3)',
  },
  text: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
  },
});
