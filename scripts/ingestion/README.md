# PDF → JSON → Supabase ingestion

Pipeline for Orthodox scripture PDFs (Amharic / Ge'ez) without copy-paste.

## 1. Place PDFs

Put text-selectable PDFs in `data/pdfs/` (e.g. `data/pdfs/enoch.pdf`).

## 2. Python extraction

```bash
pip install -r scripts/ingestion/requirements.txt
```

**Verify page 1 first:**

```bash
python scripts/ingestion/extract_bible.py --pdf data/pdfs/enoch.pdf --book-id enoch --lang geez --pages 1 --raw-out extracted_output/enoch_page1_raw.txt
```

Review `extracted_output/enoch_page1_raw.txt` and the JSON sample. Tune regexes in `extract_bible.py` (`CHAPTER_*`, `VERSE_*`) to match your PDF layout.

**Full book:**

```bash
python scripts/ingestion/extract_bible.py --pdf data/pdfs/enoch.pdf --book-id enoch --lang geez
```

Output: `extracted_output/enoch.json`

Scanned PDFs need OCR (e.g. Tesseract with Amharic/Ge'ez language packs); this script targets selectable text.

## 3. Supabase schema

In the Supabase SQL Editor, run `scripts/ingestion/schema.sql`.

## 4. Seed database

Copy `.env.example` → `.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (service role, not anon).

```bash
npm install
npm run ingest:books
npm run ingest:seed -- --file extracted_output/enoch.json
```

`--books` loads all **81** EOTC canon titles from `data/bibleCanon.json` (Amharic, Ge'ez, and English names). Verse upserts use `verse_id` so re-runs are safe.

If you already created `books` without `title_geez`, run the `ALTER TABLE` notes in `schema.sql`, then `npm run ingest:books` again.

## 5. Read scripture in the app

1. Copy `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` into `.env` (see `.env.example`).
2. Run `scripts/ingestion/schema-rls.sql` in Supabase so the anon key can **read** `books` and `verses`.
3. Ingest verses: `npm run ingest:seed -- --file extracted_output/genesis.json`
4. Restart Expo. Catalog → tap a book → chapter grid → verses.

Until data is ingested, **Genesis** includes a built-in sample (chapters 1–2) for UI testing.
