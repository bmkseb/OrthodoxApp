import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SavedTeachingRow } from '@/components/learn/saved-teaching-row';
import { BookshelfSection } from '@/components/read/bookshelf-section';
import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import {
  removeSavedTeaching,
  useSavedTeachings,
  type SavedTeaching,
} from '@/hooks/use-saved-teachings';
import { useTranslation } from '@/hooks/use-translation';

function openSavedTeaching(entry: SavedTeaching) {
  const params = new URLSearchParams({ title: entry.title });
  if (entry.subtitle) params.set('series', entry.subtitle);
  router.push(`/learn/${entry.slug}?${params.toString()}`);
}

function ListDivider() {
  return <View style={styles.divider} />;
}

type SavedTeachingListProps = {
  limit?: number;
  variant?: 'list' | 'catalog';
  entries?: SavedTeaching[];
};

export function SavedTeachingList({
  limit,
  variant = 'list',
  entries: entriesOverride,
}: SavedTeachingListProps) {
  const { t } = useTranslation();
  const { entries: savedEntries } = useSavedTeachings();
  const entries = entriesOverride ?? savedEntries;
  const items = limit != null ? entries.slice(0, limit) : entries;
  const isCatalog = variant === 'catalog';

  if (entries.length === 0) {
    if (isCatalog) {
      return (
        <ThemedText type="muted" style={styles.subsectionEmpty}>
          {t('learn.noSavedTeachings')}
        </ThemedText>
      );
    }

    return (
      <BookshelfSection list>
        <ThemedText type="muted" style={styles.subsectionEmpty}>
          {t('learn.noSavedTeachings')}
        </ThemedText>
      </BookshelfSection>
    );
  }

  const rows = items.map((entry, index) => (
    <View key={entry.slug}>
      <SavedTeachingRow
        title={entry.title}
        subtitle={entry.subtitle ?? t('learn.savedTeachings')}
        variant={variant}
        onPress={() => openSavedTeaching(entry)}
        onRemove={() => void removeSavedTeaching(entry.slug)}
      />
      {index < items.length - 1 && variant === 'list' ? <ListDivider /> : null}
    </View>
  ));

  if (isCatalog) {
    return <View style={styles.catalogList}>{rows}</View>;
  }

  return (
    <BookshelfSection list>
      <View style={styles.list}>{rows}</View>
    </BookshelfSection>
  );
}

type SavedLearnContentProps = {
  previewLimit?: number;
};

export function SavedLearnContent({ previewLimit }: SavedLearnContentProps) {
  return <SavedTeachingList limit={previewLimit} />;
}

const styles = StyleSheet.create({
  list: {
    marginTop: 0,
  },
  catalogList: {
    marginTop: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Layout.cardBorder,
    marginLeft: 60,
  },
  subsectionEmpty: {
    fontSize: 14,
    lineHeight: 21,
  },
});
