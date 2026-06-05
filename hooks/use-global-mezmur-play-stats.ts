import { useEffect, useState } from 'react';

import { fetchGlobalMezmurPlayCounts } from '@/lib/mezmur-global-plays';
import {
  subscribeMezmurPlayStats,
  type MezmurPlayStat,
} from '@/lib/mezmur-popularity';

export function useGlobalMezmurPlayStats() {
  const [stats, setStats] = useState<MezmurPlayStat[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const rows = await fetchGlobalMezmurPlayCounts();
      if (!mounted) return;
      setStats(rows);
      setReady(true);
    };

    void load();
    const unsubscribe = subscribeMezmurPlayStats(() => {
      void load();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { stats, ready };
}
