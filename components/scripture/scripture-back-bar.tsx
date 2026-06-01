import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { Layout, Palette, Space } from '@/constants/theme';
import { toggleBookmark, useIsBookmarked, type BookmarkSeed } from '@/hooks/use-bookmarks';
import { useTranslation } from '@/hooks/use-translation';

type ScriptureBackBarProps = {
  /** When provided, shows a toggle that bookmarks this page. */
  bookmark?: BookmarkSeed;
};

export function ScriptureBackBar({ bookmark }: ScriptureBackBarProps) {
  const { t } = useTranslation();
  const isBookmarked = useIsBookmarked(bookmark?.bookId ?? '', bookmark?.chapter ?? -1);

  return (
    <View style={styles.bar}>
      <OrthodoxPressable onPress={() => router.back()}>
        <ThemedText type="seeAll">{t('settings.back')}</ThemedText>
      </OrthodoxPressable>

      {bookmark ? (
        <View style={styles.actions}>
          <OrthodoxPressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              void toggleBookmark(bookmark);
            }}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'Remove Bookmark' : 'Bookmark this page'}
            accessibilityState={{ selected: isBookmarked }}
            hitSlop={10}
            style={styles.iconBtn}>
            <Icon
              name={isBookmarked ? 'bookmark-filled' : 'bookmark'}
              size={20}
              color={isBookmarked ? Palette.gold : Palette.muted}
            />
          </OrthodoxPressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.headerContentGap,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s16,
  },
  iconBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
});
