import { useEffect, useMemo, useState } from 'react';

import {
  resolveYoutubeVideoStats,
  type YoutubeVideoStatLite,
} from '@/lib/youtube-video-stats';

export function useYoutubeMezmurStats(videoIds: string[]) {
  const idsKey = useMemo(
    () => [...new Set(videoIds.map((id) => id.trim()).filter(Boolean))].sort().join(','),
    [videoIds]
  );

  const [stats, setStats] = useState<Map<string, YoutubeVideoStatLite>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const ids = idsKey ? idsKey.split(',') : [];
    setReady(false);

    void resolveYoutubeVideoStats(ids).then((map) => {
      if (!active) return;
      setStats(map);
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [idsKey]);

  return { stats, ready };
}
