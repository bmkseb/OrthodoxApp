import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { TextSizeControl } from '@/components/reader/text-size-control';
import { AppBackButton } from '@/components/ui/app-back-button';
import { Layout, Palette, Space } from '@/constants/theme';
import { toggleBookmark, useIsBookmarked, type BookmarkSeed } from '@/hooks/use-bookmarks';

type ScriptureBackBarProps = {
  /** When provided, shows a toggle that bookmarks this page. */
  bookmark?: BookmarkSeed;
  /** Shows the reading-text size control (use on actual reading pages). */
  showTextSize?: boolean;
};

export function ScriptureBackBar({ bookmark, showTextSize = false }: ScriptureBackBarProps) {
  const isBookmarked = useIsBookmarked(bookmark?.bookId ?? '', bookmark?.chapter ?? -1);

  return (
    <View style={styles.bar}>
      <AppBackButton style={styles.backBtn} />

      {showTextSize || bookmark ? (
        <View style={styles.actions}>
          {showTextSize ? <TextSizeControl /> : null}
          {bookmark ? (
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
          ) : null}
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
  backBtn: {
    marginLeft: 0,
    paddingVertical: 0,
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
