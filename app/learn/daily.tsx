import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  DailyTeachingActionBar,
  shareDailyTeaching,
} from '@/components/learn/daily-teaching/action-bar';
import { AnimatedSection } from '@/components/learn/daily-teaching/animated-section';
import { DailyTeachingHero } from '@/components/learn/daily-teaching/daily-teaching-hero';
import { DailyTeachingPrayerCard } from '@/components/learn/daily-teaching/prayer-card';
import { DailyTeachingReflectionCard } from '@/components/learn/daily-teaching/reflection-card';
import { DailyTeachingRelatedSection } from '@/components/learn/daily-teaching/related-section';
import { DailyTeachingScriptureCard } from '@/components/learn/daily-teaching/scripture-card';
import { ScriptureBackBar } from '@/components/scripture/scripture-back-bar';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { useDailyTeachingCompletion } from '@/hooks/use-daily-teaching-completion';
import { toggleSavedTeaching, useSavedTeachings } from '@/hooks/use-saved-teachings';
import { useTranslation } from '@/hooks/use-translation';
import {
  buildDailyTeachingShareMessage,
  resolveDailyTeaching,
} from '@/lib/daily-teaching';
import { Layout, Palette, Space } from '@/constants/theme';

export default function DailyTeachingScreen() {
  const { t, mode } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const resolved = useMemo(() => resolveDailyTeaching(today, mode), [today, mode]);
  const { completed, toggle: toggleCompleted } = useDailyTeachingCompletion(resolved.dateKey);
  const { isSaved } = useSavedTeachings();
  const saved = isSaved(resolved.saveSlug);

  const handleToggleSaved = () => {
    void toggleSavedTeaching({
      slug: resolved.saveSlug,
      title: resolved.title,
      subtitle: t('learn.dailyTeaching'),
    });
  };

  const handleShare = () => {
    void shareDailyTeaching(buildDailyTeachingShareMessage(resolved));
  };

  return (
    <ScreenScrollView includeFloatingChrome={false}>
      <ScriptureBackBar
        teachingSave={{
          slug: resolved.saveSlug,
          title: resolved.title,
          subtitle: t('learn.dailyTeaching'),
        }}
      />

      <View style={styles.content}>
        <AnimatedSection delay={0}>
          <DailyTeachingHero
            eyebrow={t('learn.dailyTeaching')}
            title={resolved.title}
            dateLabel={resolved.dateLabel}
            category={resolved.category}
            readMin={resolved.teaching.readMin}
            completed={completed}
            readTimeLabel={t('learn.dailyReadTime')}
            completedLabel={t('learn.dailyCompleted')}
          />
        </AnimatedSection>

        <AnimatedSection delay={60}>
          <View style={styles.teachingBlock}>
            {resolved.paragraphs.map((paragraph, index) => (
              <Text key={`p-${index}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        </AnimatedSection>

        <AnimatedSection delay={120}>
          <DailyTeachingScriptureCard
            label={t('learn.dailyScripture')}
            text={resolved.scripture.text}
            reference={resolved.scripture.reference}
          />
        </AnimatedSection>

        <AnimatedSection delay={180}>
          <DailyTeachingReflectionCard
            label={t('learn.dailyReflection')}
            question={resolved.reflection}
          />
        </AnimatedSection>

        <AnimatedSection delay={240}>
          <DailyTeachingPrayerCard label={t('learn.dailyPrayer')} prayer={resolved.prayer} />
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <DailyTeachingRelatedSection
            label={t('learn.dailyRelated')}
            saint={resolved.teaching.related.saint}
            feast={resolved.teaching.related.feast}
            fast={resolved.teaching.related.fast}
            bibleReading={resolved.teaching.related.bibleReading}
          />
        </AnimatedSection>

        <AnimatedSection delay={360}>
          <DailyTeachingActionBar
            completed={completed}
            saved={saved}
            completedLabel={
              completed ? t('learn.dailyMarkedComplete') : t('learn.dailyMarkComplete')
            }
            saveLabel={t('learn.dailySave')}
            savedLabel={t('learn.dailySaved')}
            shareLabel={t('learn.dailyShare')}
            onToggleCompleted={() => void toggleCompleted()}
            onToggleSaved={handleToggleSaved}
            onShare={handleShare}
          />
        </AnimatedSection>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Layout.pagePadding,
    paddingBottom: Space.s32,
  },
  teachingBlock: {
    marginBottom: Space.s24,
    gap: Space.s16,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    color: Palette.text,
    letterSpacing: 0.1,
  },
});
