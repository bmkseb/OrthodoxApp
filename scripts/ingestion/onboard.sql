-- Orthodox app — full Supabase onboarding (run once in SQL Editor)

CREATE TABLE IF NOT EXISTS public.books (
    book_id VARCHAR(50) PRIMARY KEY,
    title_vernacular TEXT NOT NULL,
    title_geez TEXT NOT NULL,
    title_english TEXT NOT NULL,
    testament VARCHAR(20) CHECK (testament IN ('Old Testament', 'New Testament')),
    canon_tier VARCHAR(20) CHECK (canon_tier IN ('Narrow', 'Broader')),
    display_order INT UNIQUE
);

CREATE TABLE IF NOT EXISTS public.verses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    verse_id VARCHAR(100) UNIQUE NOT NULL,
    book_id VARCHAR(50) REFERENCES public.books(book_id) ON DELETE CASCADE,
    chapter INT NOT NULL,
    verse INT NOT NULL,
    text_amharic TEXT,
    text_geez TEXT,
    text_english TEXT
);

CREATE INDEX IF NOT EXISTS idx_verses_lookup ON public.verses (book_id, chapter, verse);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read books" ON public.books;
DROP POLICY IF EXISTS "Public read verses" ON public.verses;

CREATE POLICY "Public read books"
  ON public.books FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read verses"
  ON public.verses FOR SELECT
  TO anon, authenticated
  USING (true);
