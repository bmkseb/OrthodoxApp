import { getSupabase } from '@/lib/supabase';
import type { MezmurPlayStat } from '@/lib/mezmur-popularity';

type MezmurPlayCountRow = {
  video_id: string;
  play_count: number;
  last_played_at: string;
};

function rowToStat(row: MezmurPlayCountRow): MezmurPlayStat {
  return {
    videoId: row.video_id,
    playCount: Number(row.play_count) || 0,
    lastPlayedAt: Date.parse(row.last_played_at) || Date.now(),
  };
}

/** Bump the shared play counter for a hymn (all app users). */
export async function incrementGlobalMezmurPlay(videoId: string): Promise<void> {
  const id = videoId.trim();
  if (!id) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.rpc('increment_mezmur_play_count', { p_video_id: id });
  if (error) {
    console.warn('[mezmur-global-plays] increment failed:', error.message);
  }
}

/** Fetch globally aggregated hymn play counts, highest first. */
export async function fetchGlobalMezmurPlayCounts(limit = 50): Promise<MezmurPlayStat[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('mezmur_play_counts')
    .select('video_id, play_count, last_played_at')
    .order('play_count', { ascending: false })
    .order('last_played_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[mezmur-global-plays] fetch failed:', error.message);
    return [];
  }

  return (data as MezmurPlayCountRow[] | null)?.map(rowToStat) ?? [];
}
