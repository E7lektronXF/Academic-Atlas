"""
Regenerates docs/data.json from database/AcademicAtlas.xlsx.

database/AcademicAtlas.xlsx remains the source of truth (see docs/DatabaseSchema.md).
Run this after any edit to the spreadsheet, before committing, so the website
in docs/ stays in sync with the data.

Usage:
    python scripts/xlsx_to_json.py
"""

import json
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = REPO_ROOT / "database" / "AcademicAtlas.xlsx"
JSON_PATH = REPO_ROOT / "docs" / "data.json"


def main():
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb["Database"]

    rows = list(ws.iter_rows(values_only=True))
    headers = rows[0]
    records = [
        {header: value for header, value in zip(headers, row)}
        for row in rows[1:]
        if any(cell is not None for cell in row)
    ]

    JSON_PATH.write_text(
        json.dumps(records, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} records to {JSON_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
