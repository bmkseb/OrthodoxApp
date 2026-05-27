import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { useTranslation } from '@/hooks/use-translation';
import type { TranslationKey } from '@/lib/translations';
import { ManuscriptTokens } from '@/components/sacred/manuscript-tokens';

type ExploreMicroNoteProps = {
  messageKey: TranslationKey;
  icon?: IconName;
};

/** Low-weight contextual line — liturgical rhythm between sections */
export const ExploreMicroNote = memo(function ExploreMicroNote({
  messageKey,
  icon = 'cross',
}: ExploreMicroNoteProps) {
  const { t, typography, ethiopicStyle, mode } = useTranslation();
  const amStyle = mode === 'am' ? ethiopicStyle : undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.rule} />
      <Icon name={icon} size={11} color="rgba(201, 147, 58, 0.45)" />
      <Text style={[styles.text, typography.subtitle, amStyle]} numberOfLines={2}>
        {t(messageKey)}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  rule: {
    width: 14,
    height: StyleSheet.hairlineWidth,
    backgroundColor: ManuscriptTokens.goldSoft,
    opacity: 0.35,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(138, 128, 112, 0.85)',
    letterSpacing: 0.12,
    fontStyle: 'italic',
  },
});
