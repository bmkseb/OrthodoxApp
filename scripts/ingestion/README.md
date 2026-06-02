# Book Ingestion Toolkit

Repeatable pipeline to add any book's content (chaptered like the Bible, or flat like prayers)
into Supabase via a spreadsheet. One template shape, both book types.

## Where it lives
Put this folder in your repo at `scripts/ingestion/`. It's standalone — it does not touch
your app code and cannot break the frontend. Version-controlled so your teammate (and Claude Code)
can run and extend it.

## One-time setup
```bash
pip install openpyxl psycopg2-binary
export SUPABASE_DB_URL="postgresql://...your Supabase connection string..."
```
(Get the connection string from Supabase dashboard → Project Settings → Database → Connection string.
Use a direct or pooled URL. Keep it in an env var / .env — never commit it.)

## The workflow (every book, every time)

1. **Register the source** (once per source document) in the `sources` table, with its
   tradition, publisher, and `review_status='draft'`.

2. **Generate the template** — pre-fills locked ID columns so the filler only types content:
   ```bash
   python generate_template.py --book-type prayer --book-slug daily-prayer --out daily.xlsx
   ```

3. **Fill it in.** Open the sheet, type content into `text_english` / `text_amharic` /
   `text_geez` / `text_transliteration`, set `source_slug`, and `position` (1,2,3… per section).
   - **Chaptered book?** Fill the `chapter` column on every row.
   - **Flat book (prayers)?** Leave `chapter` blank on every row.
   - Add rows by copying one and bumping `position`. Don't edit the grey columns.
   - Blank languages are fine — they're added later.

4. **Validate** (mechanical checks; won't judge translation quality):
   ```bash
   python validate_sheet.py --file daily.xlsx
   ```
   Fix any ERRORS. Warnings about missing languages are OK.

5. **Human review** — a qualified person checks translation/doctrinal fidelity and source.
   This gate is NOT automated. A passing validator never means "approved to publish."

6. **Dry-run the load** (writes nothing, shows what would happen):
   ```bash
   python load_sheet.py --file daily.xlsx --book-type prayer
   ```

7. **Commit the load** when satisfied:
   ```bash
   python load_sheet.py --file daily.xlsx --book-type prayer --commit
   ```
   Runs in one transaction — all rows load or none do. The `available_languages` trigger
   then auto-updates which language tabs appear.

## The column contract (`contract.py`)
`section_id` · `section_name` · `chapter` · `position` · `text_english` · `text_amharic` ·
`text_geez` · `text_transliteration` · `source_slug` · `review_notes`

- Locked (pre-filled, don't edit): `section_id`, `section_name`
- `chapter`: blank = flat book, filled = chaptered book. Must be all-or-nothing per book.
- The loader writes BOTH new (`position`/`text_*`) and legacy (`verse_number`/`content_*`)
  columns while your Phase 1/Phase 2 migration is in progress, so it works either way.

## Extending to new book types
`generate_template.py` currently wires up `prayer`. To add `bible`/`doctrine`, add a branch in
`fetch_sections()` that returns that hierarchy's parent rows. The loader and validator already
understand all three via `LEAF_TABLE` in `contract.py`.

## Safety properties
- Generator and validator are read-only / local — they never write to the DB.
- Loader defaults to DRY RUN; `--commit` required to write; single transaction; rolls back on any error.
- Unregistered `source_slug` aborts the load.
- Doctrinal correctness is always a human gate, never automated.
