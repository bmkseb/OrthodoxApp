-- Run after schema.sql so the mobile app can read verses with the anon key.

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read books"
  ON public.books FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read verses"
  ON public.verses FOR SELECT
  TO anon, authenticated
  USING (true);

-- Inserts/updates: use service role in seed.mjs only (bypasses RLS).
