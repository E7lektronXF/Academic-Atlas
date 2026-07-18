# AI Context

## Project Overview

Academic Atlas is an open-source, AI-maintainable database of international academic opportunities.

The project aims to help ambitious high school students discover, compare, and organize high-quality academic opportunities from around the world.

Rather than acting as a simple collection of links, Academic Atlas is intended to become a structured, verified, and maintainable knowledge base.

---

# Purpose

The primary objective of this project is to create a reliable database that helps students identify opportunities with significant educational and academic value.

The project emphasizes quality over quantity and long-term maintainability over rapid expansion.

---

# Target Audience

Academic Atlas is primarily designed for ambitious high school students interested in:

* International competitions
* Research programs
* Summer schools
* Scholarships
* Academic publications
* Conferences
* Other high-quality educational opportunities

Although the project originated from one student's academic journey, it is intended to remain useful for any motivated student.

---

# Database Philosophy

Academic Atlas follows several guiding principles:

* Quality over quantity
* Accuracy over speed
* Official sources whenever possible
* Consistent formatting
* Transparent documentation
* Long-term maintainability

Every addition to the database should improve its overall quality.

---

# Preferred Sources

Information should be collected in the following order of priority:

1. Official organizer websites
2. Official university websites
3. Official documentation
4. Official FAQ pages

Third-party websites may provide additional context but should never replace official sources.

---

# Data Standards

The database should remain internally consistent.

General standards include:

* ISO date format (`YYYY-MM-DD`) whenever possible.
* Stable identifiers for records (e.g., `COMP-0001`, `RES-0001`).
* Consistent naming conventions.
* Use `UNKNOWN` instead of guessing missing information.
* Preserve column order unless a documented structural change is made.
* Link national/regional qualifying stages to their international final with `Qualifies_For`, and mark them `Eligibility_Scope = Türkiye only` (see `docs/DatabaseSchema.md` → Qualifying Stages).

---

# Repository Structure

The repository currently consists of documentation and the database itself.

Documentation explains how the project should be maintained, while the database stores verified information.

Future structural changes should prioritize simplicity and maintainability.

---

# Maintenance Philosophy

The project is expected to evolve over multiple years.

Changes should be incremental rather than disruptive.

Existing verified information should not be removed unless it becomes outdated or incorrect.

Whenever possible:

* update existing records,
* document structural changes,
* preserve historical consistency.

---

# Current Development Phase

Current Phase:

Foundation

Current priorities:

* Repository structure
* Documentation
* Database schema

Large-scale data collection has not yet begun.

---

# Long-Term Vision

Academic Atlas aims to become a trusted and maintainable reference for international academic opportunities.

The project's long-term value depends on consistent documentation, verified information, and sustainable maintenance rather than rapid growth.

Future contributors, whether human or AI, should preserve these principles while expanding the database.
