# Changelog

All notable changes to this project will be documented in this file.

This project follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

---

## [0.7.0] - 2026-07-18

### Added

* **National pathways.** New optional schema column `Qualifies_For` links a national/regional qualifying stage to the international opportunity it feeds into (documented in `docs/DatabaseSchema.md` and enforced by `scripts/validate.py`, which also checks the reference resolves to a real record). A new `Eligibility_Scope` value `Türkiye only` marks opportunities limited to students in Türkiye.
* 8 verified Türkiye national-stage records (45 → 53), each linked to its international final: the TÜBİTAK national olympiads in Mathematics (→ IMO), Physics (→ IPhO), Chemistry (→ IChO), Informatics (→ IOI), Biology (→ IBO) and Geography (→ iGeo), the Türkiye Astronomy & Astrophysics Olympiad / TROAA (→ IOAA), and the TÜBİTAK 2204-A High School Students Research Projects Competition (→ Regeneron ISEF).
* Website: the detail view of an international competition now shows the **national pathway(s)** that lead into it, and each national stage links back to its international final. National-stage cards are marked with a crimson spine and a "→ qualifies for …" pill.
* Website: a 🇹🇷 **Türkiye** eligibility filter (alongside All · 🌍 International · 🇺🇸 US only), shareable via `?scope=tr`, and a live stats line on the home page (opportunities · categories · Türkiye pathways).

### Changed

* Website recolored to a **dark-blue / dark-red / cream** palette — navy chrome, crimson accents, cream surfaces — across both the light and dark themes, with a retuned category and pill palette. `theme-color` and the favicon were updated to match.
* The 🌍 filter label changed from "Open to Türkiye" to "International" (open worldwide) now that Türkiye has its own filter; the eligibility pill wording was updated accordingly.

### Notes

`database/AcademicAtlas.xlsx` remains the single source of truth; `docs/data.json` was regenerated with `scripts/xlsx_to_json.py` and passes `scripts/validate.py` (53 records). No existing verified records were removed or altered.

---

## [0.6.5] - 2026-07-17

### Added

* New schema column `Eligibility_Scope` (enum: `International` | `US only`) so every record states, in a machine-readable way, whether students worldwide (including Türkiye) can apply or whether it is limited to U.S. citizens/permanent residents. Documented in `docs/DatabaseSchema.md` and enforced by `scripts/validate.py`.
* 9 new verified opportunities (36 → 45), all open to international students: International Olympiad on Astronomy and Astrophysics (IOAA), International Linguistics Olympiad (IOL), International Geography Olympiad (iGeo, hosted in Istanbul in 2026), European Girls' Mathematical Olympiad (EGMO), London International Youth Science Forum (LIYSF), FIRST Global Challenge, The Hague International MUN (THIMUN), Yale Model UN (YMUN), and Rise (Schmidt Futures & Rhodes Trust).
* Website: an eligibility filter (`All · 🌍 Open to Türkiye · 🇺🇸 US only`) shown in both the home and browse views, and a colour-coded eligibility badge on every card and in the detail view. Category tile counts and the "Closing soon" strip respect the active filter, and the choice is shareable via a `?scope=` URL parameter.

### Changed

* Backfilled `Eligibility_Scope` for all 36 existing records after verifying each against its official source. 8 are `US only` (Regeneron STS, MIT PRIMES, Simons, MITES, COSMOS, QuestBridge, Coca-Cola Scholars, The Gates Scholarship); the other 37 are open to international students. Eligibility text for RSI and QuestBridge was clarified to reflect verified international/US-residency rules.

### Notes

`database/AcademicAtlas.xlsx` remains the single source of truth; `docs/data.json` was regenerated and passes `scripts/validate.py` (45 records).

---

## [0.6.0] - 2026-07-17

### Added

* 13 new verified opportunities (23 → 36 records), spread across categories: Regeneron Science Talent Search, Breakthrough Junior Challenge, Diamond Challenge, GENIUS Olympiad, Coca-Cola Scholars Program, The Gates Scholarship, PROMYS, Ross Mathematics Program, COSMOS, Journal of Emerging Investigators, National High School Journal of Science, Pioneer Academics, and Harvard CS50x. Each was verified against its official website.
* Real `Application_Deadline` values for opportunities whose next cycle is officially published: Concord Review (2026-08-01), Breakthrough Junior Challenge (2026-09-15), The Gates Scholarship (2026-09-15), Coca-Cola Scholars (2026-09-30), QuestBridge National College Match (2026-10-01), and Regeneron STS (2026-11-05). For programs that announce dates later (RSI, MIT PRIMES, John Locke, Conrad Challenge, PROMYS, Ross, COSMOS), the recurring cycle timing is documented in `Notes` and the deadline is left `UNKNOWN` rather than guessed.
* Website: a **progressive-disclosure** interface — the home page now shows category tiles (with live counts) plus a small "Closing soon" strip instead of a wall of cards. Picking a category or searching opens a paginated browse view ("Load more", 9 at a time), and clicking any card opens a detail panel with the full record.
* Website: a full opportunity **detail view** (modal) showing every field, with a deep-linkable `?id=` URL.

### Changed

* Website typography and readability: added the Inter (body) and Fraunces (display) fonts, and colour-coded information as pills — deadline urgency (red/amber/blue), free vs. paid cost, format, and status — so records are easier to scan.
* Website sort now defaults to **Deadline (soonest first)**; all views remain shareable via URL query parameters.

### Notes

`database/AcademicAtlas.xlsx` remains the single source of truth; `docs/data.json` was regenerated with `scripts/xlsx_to_json.py` and passes `scripts/validate.py`.

---

## [0.5.0] - 2026-07-17

### Added

* `scripts/validate.py` — schema validator that checks `AcademicAtlas.xlsx` against `docs/DatabaseSchema.md`: ID format/uniqueness and prefix-to-category consistency, required columns, `Category`/`Format`/`Status` enums, date formats for `Application_Deadline` and `Last_Verified` (including a no-future-date check), and `Official_URL` scheme. Exits non-zero on any error.
* `.github/workflows/data-check.yml` — CI that runs the validator and verifies `docs/data.json` was regenerated from the spreadsheet (drift detection) on every push and pull request touching the data.
* Website (`docs/`): sort control (name / category / recently verified), a "Clear filters" button, and shareable/bookmarkable views via URL query parameters (`?q=&category=&format=&status=&sort=`).
* Website cards now surface more of the schema: `Eligibility`, `Application_Deadline`, `Event_Dates`, a relative `Last_Verified` freshness label (with a "stale" flag past 180 days), and `Notes` in an expandable section.

### Changed

* `docs/index.html` — added SEO/meta description, Open Graph/Twitter link-preview tags, a favicon, a `<noscript>` fallback, and `aria-live` on the result count.
* `docs/app.js` — debounced search, graceful data-load error handling, and hardened `Official_URL` rendering (only `http(s)` links are emitted, blocking `javascript:`/`data:` URLs).
* `scripts/requirements.txt` — pinned `openpyxl==3.1.5` for reproducible builds.
* `CONTRIBUTING.md` — contribution workflow and PR checklist now include the `python scripts/validate.py` step.

### Notes

No database records were added, removed, or modified in this release; `database/AcademicAtlas.xlsx` is unchanged. GitHub Pages continues to deploy from the `main` branch `/docs` folder as before.

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
