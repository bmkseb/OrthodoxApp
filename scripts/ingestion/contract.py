"""
Shared contract for the book ingestion toolkit.
ONE template shape handles both chaptered books (Bible-style) and flat books (prayers).
The `chapter` column is blank for flat books, filled for chaptered books.
"""

# The fixed column order every generated spreadsheet uses.
# Locked columns (pre-filled, do-not-edit) + content columns (human fills).
COLUMNS = [
    "section_id",        # locked: uuid of the section/book-leaf-parent (blank if pure chapter/verse book)
    "section_name",      # locked: human-readable label so the filler knows where they are
    "chapter",           # OPTIONAL: integer. Blank = flat book (prayers). Filled = chaptered book (Bible).
    "position",          # required: order of the line/verse within its section (or within chapter)
    "text_english",
    "text_amharic",
    "text_geez",
    "text_transliteration",
    "source_slug",       # required: must match a row in public.sources
    "review_notes",      # free text for the human reviewer
]

LOCKED_COLUMNS = {"section_id", "section_name"}   # greyed out in the sheet
LANGUAGE_COLUMNS = {
    "english": "text_english",
    "amharic": "text_amharic",
    "geez": "text_geez",
    "transliteration": "text_transliteration",
}

# Which DB table each book "type" loads into.
# 'prayer'  -> prayer_sections / prayer_verses   (flat: section -> verse)
# 'bible'   -> books / verses                    (chaptered: book -> chapter+verse)
# 'doctrine'-> doctrine_subtopics / doctrine_passages (flat)
LEAF_TABLE = {
    "prayer":   {"leaf": "prayer_verses",     "parent_fk": "section_id"},
    "bible":    {"leaf": "verses",            "parent_fk": "book_id"},
    "doctrine": {"leaf": "doctrine_passages", "parent_fk": "subtopic_id"},
}
