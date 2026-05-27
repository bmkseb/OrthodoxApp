import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
} from 'react-native';

import { GoldCrossSpinner } from '@/components/ui/gold-cross-spinner';
import { Palette } from '@/constants/theme';

type PullToRefreshScrollProps = ScrollViewProps & {
  onRefresh?: () => Promise<void> | void;
};

export function PullToRefreshScroll({
  onRefresh,
  children,
  ...rest
}: PullToRefreshScrollProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      bounces
      overScrollMode="always"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.gold}
            colors={[Palette.gold]}
            progressViewOffset={0}
          />
        ) : undefined
      }
      {...rest}>
      {refreshing ? <GoldCrossSpinner /> : null}
      {children}
    </ScrollView>
  );
}
