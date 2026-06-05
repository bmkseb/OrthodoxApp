-- Global in-app hymn play counts for the Discover top-10 shelf.
-- Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.mezmur_play_counts (
  video_id TEXT PRIMARY KEY,
  play_count BIGINT NOT NULL DEFAULT 0 CHECK (play_count >= 0),
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mezmur_play_counts_rank_idx
  ON public.mezmur_play_counts (play_count DESC, last_played_at DESC);

ALTER TABLE public.mezmur_play_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read mezmur play counts"
  ON public.mezmur_play_counts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.increment_mezmur_play_count(p_video_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_video_id IS NULL OR length(trim(p_video_id)) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.mezmur_play_counts (video_id, play_count, last_played_at, updated_at)
  VALUES (trim(p_video_id), 1, now(), now())
  ON CONFLICT (video_id) DO UPDATE SET
    play_count = public.mezmur_play_counts.play_count + 1,
    last_played_at = now(),
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_mezmur_play_count(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_mezmur_play_count(TEXT) TO anon, authenticated;
