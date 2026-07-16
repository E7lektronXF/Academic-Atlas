# Changelog

All notable changes to this project will be documented in this file.

This project follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

---

## [0.4.0] - 2026-07-16

### Added

* `docs/data.json` — machine-readable export of the database, generated from `AcademicAtlas.xlsx`
* `scripts/xlsx_to_json.py` — regenerates `docs/data.json` from the spreadsheet
* `docs/index.html`, `docs/style.css`, `docs/app.js` — a static, searchable/filterable website for browsing the database, intended to be served via GitHub Pages from `/docs`
* CONTRIBUTING and PR checklist items requiring `docs/data.json` to be regenerated after spreadsheet edits

### Notes

`database/AcademicAtlas.xlsx` remains the single source of truth; `docs/data.json` is a generated artifact and should not be hand-edited. GitHub Pages must be enabled in repository settings (Settings → Pages → Source: Deploy from branch → `main` / `docs`) for the site to go live.

---

## [0.3.0] - 2026-07-16

### Added

* First 23 verified records across all 8 categories in `database/AcademicAtlas.xlsx`: IMO, IPhO, IChO, IOI, IBO, Regeneron ISEF, John Locke Institute Essay Competition, World Scholar's Cup, RSI, MIT PRIMES, Simons Summer Research Program, Summer Science Program, Yale Young Global Scholars, MITES, Davis UWC Scholars Program, QuestBridge National College Match, Johns Hopkins CTY, Stanford Online High School, Conrad Challenge, Technovation Girls, The Concord Review, Journal of Student Research, Harvard Model United Nations

### Notes

Stable fields (Name, Organizer, Official_URL, Category, Country_Region, Format) were verified against each program's official website. `Application_Deadline` and `Event_Dates` are intentionally left as `UNKNOWN` since these change annually — see each record's `Notes` field for guidance on checking the current cycle.

---

## [0.2.0] - 2026-07-16

### Added

* `docs/DatabaseSchema.md` — full column definitions, ID prefix conventions per category, and special value rules (`UNKNOWN`, `Rolling`)
* `database/AcademicAtlas.xlsx` — empty database template matching the schema, with a Reference sheet for prefixes and special values
* `CONTRIBUTING.md` — contribution workflow for adding, correcting, and archiving records
* GitHub issue templates: new opportunity suggestion, data error report, structural change proposal
* GitHub pull request template with a sourcing/formatting checklist

### Notes

This release completes the repository scaffolding described in the README's planned structure. No database entries have been added yet; the next phase is populating an initial, hand-verified set of records.

---

## [0.1.0] - 2026-07-12

### Added

* Initial GitHub repository
* Project identity
* Repository description
* README
* CHANGELOG
* AI_CONTEXT (planned)
* Initial database planning

### Notes

This release establishes the project's foundation. No database entries have been added yet.
