-- Orthodox App — enable Row Level Security on all public content tables.
-- Run once in Supabase Dashboard → SQL Editor (project: wjuevafbzkjmkjqgsfdo).
--
-- Effect:
--   • anon / authenticated: SELECT only (read catalog content in the app)
--   • writes / deletes: service role only (sync scripts, seeding)
--
-- Re-running is safe (idempotent).

-- ── 1. Enable RLS on every app table that exists ───────────────────────────

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'books',
    'verses',
    'mezmur',
    'mezmur_play_counts',
    'doctrine_topics',
    'doctrine_subtopics',
    'doctrine_passages',
    'prayer_books',
    'prayer_sections',
    'prayer_verses'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      RAISE NOTICE 'RLS enabled on public.%', t;
    ELSE
      RAISE NOTICE 'Skipped (table does not exist): public.%', t;
    END IF;
  END LOOP;
END $$;

-- ── 2. Read-only policies for the mobile app (anon + authenticated) ─────────

-- Scripture
DROP POLICY IF EXISTS "Public read books" ON public.books;
CREATE POLICY "Public read books"
  ON public.books FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read verses" ON public.verses;
CREATE POLICY "Public read verses"
  ON public.verses FOR SELECT
  TO anon, authenticated
  USING (true);

-- Mezmur catalog (hide rejected rows from clients)
DROP POLICY IF EXISTS "Public read mezmur" ON public.mezmur;
CREATE POLICY "Public read mezmur"
  ON public.mezmur FOR SELECT
  TO anon, authenticated
  USING (status IS DISTINCT FROM 'rejected');

-- Global play counts (writes go through increment_mezmur_play_count RPC)
DROP POLICY IF EXISTS "Public read mezmur play counts" ON public.mezmur_play_counts;
CREATE POLICY "Public read mezmur play counts"
  ON public.mezmur_play_counts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Doctrine / Learn
DROP POLICY IF EXISTS "Public read doctrine topics" ON public.doctrine_topics;
CREATE POLICY "Public read doctrine topics"
  ON public.doctrine_topics FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read doctrine subtopics" ON public.doctrine_subtopics;
CREATE POLICY "Public read doctrine subtopics"
  ON public.doctrine_subtopics FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read doctrine passages" ON public.doctrine_passages;
CREATE POLICY "Public read doctrine passages"
  ON public.doctrine_passages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Prayer books
DROP POLICY IF EXISTS "Public read prayer books" ON public.prayer_books;
CREATE POLICY "Public read prayer books"
  ON public.prayer_books FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read prayer sections" ON public.prayer_sections;
CREATE POLICY "Public read prayer sections"
  ON public.prayer_sections FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read prayer verses" ON public.prayer_verses;
CREATE POLICY "Public read prayer verses"
  ON public.prayer_verses FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── 3. Verify (optional — check Security Advisor again after running) ───────
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
