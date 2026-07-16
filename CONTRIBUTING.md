# Contributing to Academic Atlas

Thank you for considering a contribution. Academic Atlas prioritizes accuracy and long-term maintainability over speed or volume — please read this guide before opening a pull request.

## Before You Start

* Read `README.md` for the project's goals and principles.
* Read `AI_CONTEXT.md` for the data philosophy and maintenance rules.
* Read `docs/DatabaseSchema.md` for the exact column definitions and ID conventions.

## Ways to Contribute

### 1. Adding a New Opportunity

1. Verify the opportunity against an **official source** (organizer, university, or official documentation — see README → Data Sources). Third-party aggregators are not acceptable as the sole source.
2. Open `database/AcademicAtlas.xlsx`.
3. Assign the next sequential `ID` for its category (see the prefix table in `docs/DatabaseSchema.md`).
4. Fill in every required column. Use `UNKNOWN` instead of guessing.
5. Set `Last_Verified` to the date you confirmed the information.
6. Do not reorder, rename, or remove existing columns.
7. Open a pull request with a short description and a link to the official source you used.

### 2. Correcting or Updating a Record

* Update the relevant fields directly rather than deleting and re-adding the row.
* Update `Last_Verified` to the date of your correction.
* Explain the correction and cite the official source in the pull request description.

### 3. Retiring an Opportunity

* If a program/competition no longer runs, set `Status` to `Archived`. Do not delete the row — historical records are kept for consistency.

### 4. Reporting a Problem

If you notice incorrect, outdated, or unverifiable data but aren't able to fix it yourself, please open an issue using the appropriate issue template instead of a pull request.

## Pull Request Checklist

* [ ] Information is sourced from an official website/documentation.
* [ ] All required columns from `docs/DatabaseSchema.md` are filled.
* [ ] `ID` follows the correct prefix and is not reused.
* [ ] Dates use `YYYY-MM-DD`, or `Rolling`/`UNKNOWN` where explicitly allowed.
* [ ] `Last_Verified` is set.
* [ ] No existing verified rows were removed or altered without justification.

## Proposing Structural Changes

Changes to the schema itself (new columns, new categories, new prefixes) should be proposed as an issue first, so they can be discussed before being implemented — see the maintenance philosophy in `AI_CONTEXT.md` (incremental, documented, non-destructive).
