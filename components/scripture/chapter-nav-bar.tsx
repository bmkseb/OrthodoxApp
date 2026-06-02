import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OrthodoxPressable } from '@/components/orthodox-pressable';
import { ThemedText } from '@/components/themed-text';
import { scriptureLangQuery } from '@/hooks/use-scripture-lang';
import { formatScriptureNumber } from '@/lib/scripture';
import type { ScriptureLang } from '@/types/scripture';
import { useTranslation } from '@/hooks/use-translation';
import { BorderRadius, Layout, Palette, Space } from '@/constants/theme';

type ChapterNavBarProps = {
  bookId: string;
  chapter: number;
  chapters: number[];
  lang: ScriptureLang;
};

export function ChapterNavBar({ bookId, chapter, chapters, lang }: ChapterNavBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const langQ = scriptureLangQuery(lang);

  const index = chapters.indexOf(chapter);
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const goToChapter = (ch: number) => {
    router.replace(`/book/${bookId}/${ch}${langQ}`);
  };

  if (chapters.length === 0) return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Space.s12) }]}>
      <OrthodoxPressable
        style={[styles.navBtn, !prevChapter && styles.navBtnDisabled]}
        onPress={() => prevChapter != null && goToChapter(prevChapter)}
        disabled={prevChapter == null}
        accessibilityLabel={t('scripture.previousChapter')}>
        <Icon name="chevron-left" size={18} color={prevChapter ? Palette.gold : Palette.muted} />
        <ThemedText style={[styles.navLabel, !prevChapter && styles.navLabelDisabled]}>
          {t('scripture.previousChapter')}
        </ThemedText>
      </OrthodoxPressable>

      <ThemedText type="muted" style={styles.center}>
        {t('scripture.chapter')} {formatScriptureNumber(chapter, lang)}
        {chapters.length > 1 ? ` / ${formatScriptureNumber(chapters.length, lang)}` : ''}
      </ThemedText>

      <OrthodoxPressable
        style={[styles.navBtn, styles.navBtnNext, !nextChapter && styles.navBtnDisabled]}
        onPress={() => nextChapter != null && goToChapter(nextChapter)}
        disabled={nextChapter == null}
        accessibilityLabel={t('scripture.nextChapter')}>
        <ThemedText style={[styles.navLabel, !nextChapter && styles.navLabelDisabled]}>
          {t('scripture.nextChapter')}
        </ThemedText>
        <Icon name="chevron-right" size={18} color={nextChapter ? Palette.gold : Palette.muted} />
      </OrthodoxPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.s8,
    paddingTop: Space.s12,
    paddingHorizontal: Layout.pagePadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Layout.cardBorder,
    backgroundColor: Palette.background,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Space.s8,
    paddingHorizontal: Space.s8,
    borderRadius: BorderRadius.md,
    maxWidth: '38%',
  },
  navBtnNext: {
    justifyContent: 'flex-end',
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text,
  },
  navLabelDisabled: {
    color: Palette.muted,
  },
  center: {
    fontSize: 12,
    textAlign: 'center',
    flexShrink: 0,
  },
});
