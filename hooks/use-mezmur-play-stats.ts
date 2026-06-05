import { useEffect, useState } from 'react';

import {
  ensureMezmurPlayStatsLoaded,
  getMezmurPlayStats,
  subscribeMezmurPlayStats,
  type MezmurPlayStat,
} from '@/lib/mezmur-popularity';

export function useMezmurPlayStats() {
  const [stats, setStats] = useState<MezmurPlayStat[]>(getMezmurPlayStats());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setStats(getMezmurPlayStats());
      setReady(true);
    };
    const unsubscribe = subscribeMezmurPlayStats(sync);
    void ensureMezmurPlayStatsLoaded().then(sync);
    sync();
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { stats, ready };
}
