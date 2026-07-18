# Database Schema

This document defines the structure of `database/AcademicAtlas.xlsx`. It is the single source of truth for anyone (human or AI) adding or editing records.

Changes to this schema are structural changes and must follow the maintenance philosophy in `AI_CONTEXT.md`: incremental, documented, and non-destructive.

The rules below are enforced automatically by `scripts/validate.py` (run locally and in CI). Run `python scripts/validate.py` before committing; a failing check will block the change.

---

## Identifier Convention

Every record has a permanent, unique `ID` that never changes once assigned, even if other fields are edited later.

Format: `PREFIX-NNNN` (4-digit, zero-padded, sequential within its category).

| Prefix   | Category                          |
|----------|-----------------------------------|
| `COMP`   | International competitions        |
| `RES`    | Research programs / opportunities |
| `SUM`    | Summer schools                    |
| `SCHOL`  | Scholarships                      |
| `COURSE` | Academic courses                  |
| `INNOV`  | Innovation challenges             |
| `JOUR`   | Academic journals & publications  |
| `CONF`   | Conferences & academic events     |

New categories require a new prefix, added here first, before any record uses it.

---

## Columns

Column order must be preserved unless a documented structural change is made.

| # | Column                | Type            | Required | Description |
|---|-----------------------|-----------------|----------|--------------|
| 1 | `ID`                  | string          | Yes      | Stable identifier, e.g. `COMP-0001`. Never reused or renumbered. |
| 2 | `Category`            | enum            | Yes      | One of the categories listed above (full name, not prefix). |
| 3 | `Name`                | string          | Yes      | Official name of the opportunity. |
| 4 | `Organizer`           | string          | Yes      | Institution or organization running it. |
| 5 | `Country_Region`      | string          | Yes      | Host country/region, or `International`. |
| 6 | `Eligibility`         | string          | Yes      | Who can apply (grade level, age, nationality restrictions, etc.). Use `UNKNOWN` if not stated by the official source. |
| 7 | `Description`         | string          | Yes      | Short, neutral, factual description (1-3 sentences). |
| 8 | `Official_URL`        | string (URL)    | Yes      | Link to the official source. Must not be a third-party aggregator. |
| 9 | `Application_Deadline`| date (ISO)      | Yes      | `YYYY-MM-DD`, or `Rolling`, or `UNKNOWN`. |
| 10| `Event_Dates`         | string          | No       | ISO date or range for when the program/event itself occurs. `UNKNOWN` if not yet announced. |
| 11| `Cost`                | string          | Yes      | `Free`, `Paid`, an amount, or `UNKNOWN`. For scholarships/grants, the award amount. |
| 12| `Format`              | enum            | Yes      | `Online`, `In-person`, `Hybrid`, or `UNKNOWN`. |
| 13| `Status`              | enum            | Yes      | `Active`, `Upcoming`, `Archived`. `Archived` is used instead of deleting a record. |
| 14| `Last_Verified`       | date (ISO)      | Yes      | `YYYY-MM-DD` the contributor last confirmed this record against the official source. |
| 15| `Notes`               | string          | No       | Any additional context that doesn't fit another column. |
| 16| `Eligibility_Scope`   | enum            | Yes      | Who is eligible by citizenship/residency: `International` (open to students worldwide, including Türkiye), `Türkiye only` (limited to students in Türkiye — e.g. national olympiads and other qualifying stages), or `US only` (limited to U.S. citizens/permanent residents, including U.S. state-restricted programs). Nationality nuances stay in `Eligibility`. |
| 17| `Qualifies_For`       | string (ID)     | No       | For a national/regional qualifying stage, the `ID` of the international opportunity it feeds into (e.g. `COMP-0001`). Must reference an existing record. Leave empty for stand-alone opportunities. Used by the website to show the local pathway to an international competition. |

---

## Special Values

* `UNKNOWN` — the official source does not state this information. Never guess or estimate.
* `Rolling` — valid only for `Application_Deadline`, when the official source explicitly states rolling admissions.
* Empty cells are not used; every applicable required column must contain one of the above instead. Optional columns (`Event_Dates`, `Notes`, `Qualifies_For`) may legitimately be empty.

---

## Qualifying Stages (National Pathways)

Many international competitions cannot be entered directly: a student first has to advance through a **national selection process** in their own country. Academic Atlas records these local stages as their own entries so that a student can see the full route to an international final.

A qualifying-stage record is a normal record that additionally:

* sets `Qualifies_For` to the `ID` of the international opportunity it leads to (e.g. Türkiye's national mathematics olympiad sets `Qualifies_For` = the IMO record's ID);
* uses `Country_Region` to name the country/region the stage is run in (e.g. `Türkiye`);
* sets `Eligibility_Scope` to `Türkiye only` (or the relevant national scope) rather than `International`.

The website reads `Qualifies_For` to display, on an international competition, the national pathway(s) that lead to it, and to link each stage back to its final. This keeps the local and international views connected without duplicating information.

---

## Adding a Record

1. Confirm the information against an official source (see `README.md` → Data Sources).
2. Assign the next sequential ID for the relevant category.
3. Fill every required column; use `UNKNOWN` only when the official source truly omits the information.
4. Set `Last_Verified` to the date you checked the source.
5. Do not reorder or rename existing columns as part of a data-only contribution.

## Editing or Retiring a Record

* Prefer updating a record over deleting it.
* If an opportunity no longer runs, set `Status` to `Archived` rather than removing the row.
* Update `Last_Verified` whenever any field is re-confirmed or corrected.
