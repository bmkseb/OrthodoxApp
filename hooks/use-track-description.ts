import { useEffect, useState } from 'react';

import type { AudioTrack } from '@/contexts/audio-player-context';
import { fetchMezmurDescription } from '@/lib/mezmur';

export function useTrackDescription(track: AudioTrack | null) {
  const [description, setDescription] = useState<string | null>(track?.description ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!track?.videoId) {
      setDescription(track?.description ?? null);
      setLoading(false);
      return;
    }

    if (track.description?.trim()) {
      setDescription(track.description.trim());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setDescription(null);

    void fetchMezmurDescription(track.videoId).then((text) => {
      if (cancelled) return;
      setDescription(text?.trim() || null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [track?.videoId, track?.description]);

  return { description, loading };
}
