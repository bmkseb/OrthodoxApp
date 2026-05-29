#!/usr/bin/env python3
"""
Extract text-selectable Orthodox scripture PDFs into verse JSON for Supabase.

Usage:
  pip install -r scripts/ingestion/requirements.txt
  python scripts/ingestion/extract_bible.py --pdf data/pdfs/enoch.pdf --book-id enoch --lang geez
  python scripts/ingestion/extract_bible.py --pdf data/pdfs/enoch.pdf --book-id enoch --pages 1
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# Ethiopic numerals (Ge'ez) → integer
ETHIOPIC_DIGITS = {
    "፩": 1,
    "፪": 2,
    "፫": 3,
    "፬": 4,
    "፭": 5,
    "፮": 6,
    "፯": 7,
    "፰": 8,
    "፱": 9,
    "፲": 10,
    "፳": 20,
    "፴": 30,
    "፵": 40,
    "፶": 50,
    "፷": 60,
    "፸": 70,
    "፹": 80,
    "፺": 90,
    "፻": 100,
}

CHAPTER_GEez = re.compile(
    r"(?:ምዕራፍ|ምዕራፍ|ምዕ\.?)\s*([፩-፼\d]+)",
    re.UNICODE | re.IGNORECASE,
)
CHAPTER_LATIN = re.compile(
    r"(?:chapter|ch\.?)\s*([፩-፼\d]+|\d+)",
    re.UNICODE | re.IGNORECASE,
)
VERSE_REF = re.compile(
    r"^\s*(\d+)\s*:\s*(\d+)\s*(.*)$",
    re.UNICODE,
)
# Line starts with verse number (Arabic or Ethiopic), then punctuation/break
VERSE_LINE = re.compile(
    r"^\s*([፩-፼\d]{1,4})[\.\)\:\-\s]+(.+)$",
    re.UNICODE,
)

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = ROOT / "extracted_output"


def ethiopic_to_int(token: str) -> int | None:
    token = token.strip()
    if not token:
        return None
    if token.isdigit():
        return int(token)
    total = 0
    for ch in token:
        if ch in ETHIOPIC_DIGITS:
            total += ETHIOPIC_DIGITS[ch]
        elif ch.isdigit():
            total = total * 10 + int(ch)
        else:
            return None
    return total if total > 0 else None


def parse_number(token: str) -> int | None:
    return ethiopic_to_int(token)


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def extract_pdf_text(pdf_path: Path, pages: list[int] | None = None) -> str:
    """Prefer pdfplumber for layout-aware extraction; fall back to pypdf."""
    full_text: list[str] = []

    try:
        import pdfplumber  # type: ignore
    except ImportError:
        pdfplumber = None

    if pdfplumber is not None:
        with pdfplumber.open(pdf_path) as pdf:
            indices = (
                range(len(pdf.pages))
                if pages is None
                else [p - 1 for p in pages if 0 < p <= len(pdf.pages)]
            )
            for i in indices:
                page = pdf.pages[i]
                text = page.extract_text() or ""
                if text:
                    full_text.append(text)
        return normalize_whitespace("\n".join(full_text))

    from pypdf import PdfReader  # type: ignore

    reader = PdfReader(str(pdf_path))
    indices = (
        range(len(reader.pages))
        if pages is None
        else [p - 1 for p in pages if 0 < p <= len(reader.pages)]
    )
    for i in indices:
        text = reader.pages[i].extract_text()
        if text:
            full_text.append(text)
    return normalize_whitespace("\n".join(full_text))


def make_verse_id(book_id: str, chapter: int, verse: int) -> str:
    return f"{book_id}_{chapter:03d}_{verse:03d}"


def verse_row(
    book_id: str,
    chapter: int,
    verse: int,
    text: str,
    lang: str,
) -> dict:
    row: dict = {
        "verse_id": make_verse_id(book_id, chapter, verse),
        "book_id": book_id,
        "chapter": chapter,
        "verse": verse,
        "text_amharic": None,
        "text_geez": None,
        "text_english": None,
    }
    key = {
        "amharic": "text_amharic",
        "geez": "text_geez",
        "english": "text_english",
    }.get(lang, "text_geez")
    row[key] = text.strip()
    return row


def parse_text_to_json(raw_text: str, book_id: str, lang: str) -> list[dict]:
    """
    Split cleaned PDF text into chapter/verse records.

    Customize CHAPTER_* / VERSE_* regexes in this file if your PDF layout differs.
    """
    verses: list[dict] = []
    current_chapter = 1
    current_verse = 0
    buffer: list[str] = []

    def flush_verse() -> None:
        nonlocal current_verse, buffer
        if not buffer:
            return
        body = " ".join(buffer).strip()
        buffer.clear()
        if not body:
            return
        if current_verse < 1:
            current_verse = 1
        verses.append(
            verse_row(book_id, current_chapter, current_verse, body, lang)
        )

    for line in raw_text.split("\n"):
        line = line.strip()
        if not line:
            continue

        ch_match = CHAPTER_GEez.search(line) or CHAPTER_LATIN.search(line)
        if ch_match and len(line) < 80:
            flush_verse()
            num = parse_number(ch_match.group(1))
            if num is not None:
                current_chapter = num
                current_verse = 0
            continue

        ref_match = VERSE_REF.match(line)
        if ref_match:
            flush_verse()
            ch, vs = int(ref_match.group(1)), int(ref_match.group(2))
            current_chapter, current_verse = ch, vs
            rest = ref_match.group(3).strip()
            if rest:
                buffer.append(rest)
            continue

        line_match = VERSE_LINE.match(line)
        if line_match:
            flush_verse()
            vs_num = parse_number(line_match.group(1))
            if vs_num is not None:
                current_verse = vs_num
                buffer.append(line_match.group(2).strip())
            else:
                buffer.append(line)
            continue

        if current_verse < 1:
            current_verse = 1
        buffer.append(line)

    flush_verse()
    return verses


def main() -> int:
    parser = argparse.ArgumentParser(description="PDF → verse JSON extractor")
    parser.add_argument("--pdf", required=True, help="Path to source PDF")
    parser.add_argument("--book-id", required=True, help="Stable book_id for Supabase")
    parser.add_argument(
        "--lang",
        choices=("geez", "amharic", "english"),
        default="geez",
        help="Which text_* column to populate",
    )
    parser.add_argument(
        "--pages",
        type=str,
        default=None,
        help='Page range, e.g. "1" or "1-3" (1-based). Omit for full document.',
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output JSON path (default: extracted_output/<book-id>.json)",
    )
    parser.add_argument(
        "--raw-out",
        type=Path,
        default=None,
        help="Optional path to dump raw extracted text for debugging",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.is_file():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    page_list: list[int] | None = None
    if args.pages:
        page_list = []
        for part in args.pages.split(","):
            part = part.strip()
            if "-" in part:
                start_s, end_s = part.split("-", 1)
                start, end = int(start_s), int(end_s)
                page_list.extend(range(start, end + 1))
            else:
                page_list.append(int(part))

    print(f"Extracting {pdf_path} …")
    raw = extract_pdf_text(pdf_path, page_list)
    if not raw:
        print("No text extracted. If the PDF is scanned, use OCR (e.g. Tesseract).", file=sys.stderr)
        return 1

    if args.raw_out:
        args.raw_out.parent.mkdir(parents=True, exist_ok=True)
        args.raw_out.write_text(raw, encoding="utf-8")
        print(f"Wrote raw text → {args.raw_out}")

    records = parse_text_to_json(raw, args.book_id, args.lang)
    if not records:
        print(
            "Parser produced 0 verses. Inspect --raw-out and tune regexes in extract_bible.py.",
            file=sys.stderr,
        )
        return 1

    out_path = args.out or (DEFAULT_OUT / f"{args.book_id}.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} verses → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
