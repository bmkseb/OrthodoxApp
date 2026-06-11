import * as Haptics from 'expo-haptics';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { BorderRadius, Palette, Space } from '@/constants/theme';

type DailyTeachingActionBarProps = {
  completed: boolean;
  saved: boolean;
  completedLabel: string;
  saveLabel: string;
  savedLabel: string;
  shareLabel: string;
  onToggleCompleted: () => void;
  onToggleSaved: () => void;
  onShare: () => void;
};

export function DailyTeachingActionBar({
  completed,
  saved,
  completedLabel,
  saveLabel,
  savedLabel,
  shareLabel,
  onToggleCompleted,
  onToggleSaved,
  onShare,
}: DailyTeachingActionBarProps) {
  return (
    <View style={styles.wrap}>
      <OrthodoxPressable
        style={[styles.primaryBtn, completed && styles.primaryBtnDone]}
        onPress={() => {
          Haptics.notificationAsync(
            completed
              ? Haptics.NotificationFeedbackType.Warning
              : Haptics.NotificationFeedbackType.Success
          ).catch(() => {});
          onToggleCompleted();
        }}>
        <Icon name="cross" size={16} color={completed ? Palette.gold : Palette.text} />
        <Text style={[styles.primaryText, completed && styles.primaryTextDone]}>
          {completedLabel}
        </Text>
      </OrthodoxPressable>

      <View style={styles.secondaryRow}>
        <OrthodoxPressable style={styles.secondaryBtn} onPress={onToggleSaved}>
          <Icon
            name={saved ? 'bookmark-filled' : 'bookmark'}
            size={18}
            color={saved ? Palette.gold : Palette.muted}
          />
          <Text style={styles.secondaryText}>{saved ? savedLabel : saveLabel}</Text>
        </OrthodoxPressable>

        <OrthodoxPressable style={styles.secondaryBtn} onPress={onShare}>
          <Icon name="share" size={18} color={Palette.muted} />
          <Text style={styles.secondaryText}>{shareLabel}</Text>
        </OrthodoxPressable>
      </View>
    </View>
  );
}

export async function shareDailyTeaching(message: string) {
  try {
    await Share.share({ message });
  } catch {
    // User dismissed share sheet.
  }
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Space.s8,
    marginBottom: Space.s24,
    gap: Space.s12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    paddingVertical: Space.s12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 147, 58, 0.3)',
    backgroundColor: 'rgba(201, 147, 58, 0.1)',
  },
  primaryBtnDone: {
    backgroundColor: 'rgba(201, 147, 58, 0.18)',
    borderColor: 'rgba(201, 147, 58, 0.45)',
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  primaryTextDone: {
    color: Palette.gold,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Space.s8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s8,
    paddingVertical: Space.s12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.muted,
  },
});
