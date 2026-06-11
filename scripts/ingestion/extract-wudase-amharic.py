#!/usr/bin/env python3
"""Extract Amharic Wudase Mariam stanzas from the source PDF into JSON."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Install PyMuPDF: pip install pymupdf") from exc

ETHIOPIAN_DIGITS = {
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

DAY_PATTERNS = [
    ("Monday", r"የሰኞ\s+ውዳሴ\s+ማርያም"),
    ("Tuesday", r"የማክሰኞ\s+ውዳሴ\s+ማርያም"),
    ("Wednesday", r"የረቡዕ\s+ውዳሴ\s+ማርያም"),
    ("Thursday", r"የሐሙስ\s+ውዳሴ\s+ማርያም"),
    ("Friday", r"የዓርብ\s+ውዳሴ\s+ማርያም"),
    ("Saturday", r"የቅዳሜ\s+ውዳሴ\s+ማርያም"),
    ("Sunday", r"ውዳሴ\s+ማርያም\s*\(Sunday\)"),
]

DEFAULT_PDF = Path.home() / "Downloads" / "widase mariam.pdf"
DEFAULT_OUT = Path(__file__).resolve().parent / "wudase-amharic.json"


def parse_eth_number(raw: str) -> int | None:
    s = re.sub(r"\s+", "", raw.strip())
    if not s:
        return None
    if re.fullmatch(r"\d+", s):
        return int(s)

    total = 0
    i = 0
    while i < len(s):
        matched = False
        for length in (2, 1):
            chunk = s[i : i + length]
            if chunk in ETHIOPIAN_DIGITS:
                total += ETHIOPIAN_DIGITS[chunk]
                i += length
                matched = True
                break
        if not matched:
            return None
    return total


def normalize_stanza(text: str) -> str:
    text = re.sub(r"\s*\n\s*", " ", text.strip())
    return re.sub(r" +", " ", text)


def extract_pdf(pdf_path: Path) -> dict[str, dict[str, str]]:
    doc = fitz.open(pdf_path)
    full = "\n".join(page.get_text() for page in doc)
    full = re.sub(r"[ \t]+", " ", full)

    sections: dict[str, dict[str, str]] = {}
    for idx, (day, pattern) in enumerate(DAY_PATTERNS):
        match = re.search(pattern, full)
        if not match:
            raise ValueError(f"Day header not found: {day}")

        start = match.end()
        end = len(full)
        for _, next_pattern in DAY_PATTERNS[idx + 1 :]:
            next_match = re.search(next_pattern, full[start:])
            if next_match:
                end = start + next_match.start()
                break

        body = full[start:end].strip()
        parts = re.split(r"(?:^|\n)([፩-፼\d]+)\s+", body)
        stanzas: dict[str, str] = {}
        for num, text in zip(parts[1::2], parts[2::2]):
            position = parse_eth_number(num)
            if position is None:
                continue
            stanzas[str(position)] = normalize_stanza(text)

        sections[day] = stanzas

    return sections


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    sections = extract_pdf(pdf_path)
    out_path.write_text(json.dumps(sections, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path} ({sum(len(v) for v in sections.values())} stanzas)")


if __name__ == "__main__":
    main()
