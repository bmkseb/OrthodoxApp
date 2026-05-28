-- Orthodox scripture catalog and verses (run in Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS public.books (
    book_id VARCHAR(50) PRIMARY KEY,
    title_vernacular TEXT NOT NULL,
    title_geez TEXT NOT NULL,
    title_english TEXT NOT NULL,
    testament VARCHAR(20) CHECK (testament IN ('Old Testament', 'New Testament')),
    canon_tier VARCHAR(20) CHECK (canon_tier IN ('Narrow', 'Broader')),
    display_order INT UNIQUE
);

-- If books already exists without title_geez, run once in SQL Editor:
-- ALTER TABLE public.books ADD COLUMN IF NOT EXISTS title_geez TEXT;
-- UPDATE public.books SET title_geez = title_vernacular WHERE title_geez IS NULL;
-- ALTER TABLE public.books ALTER COLUMN title_geez SET NOT NULL;

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
