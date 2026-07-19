# Academic Atlas

> An open, AI-maintainable database of international academic opportunities.

Academic Atlas is an open-source project designed to help ambitious high school students discover and organize high-quality academic opportunities from around the world.

Rather than being a simple list of competitions or programs, Academic Atlas aims to become a structured, transparent, and continuously maintainable knowledge base of verified opportunities.

The project focuses on quality over quantity and prioritizes official, up-to-date, and well-documented information.

**Browse the database:** https://e7lektronxf.github.io/Academic-Atlas/

Filter by category, **subject** (Mathematics, Physics, Computer Science, …), or eligibility, and save opportunities to a personal shortlist you can share with a link.

---

## What is included?

Academic Atlas is designed to cover opportunities such as:

* 🌍 International competitions
* 🔬 Research programs
* ☀️ Summer schools
* 🎓 Scholarships
* 📚 Academic courses
* 🧠 Research opportunities
* 💡 Innovation challenges
* 📰 Academic journals and publications
* 🎤 Conferences and academic events

Additional categories may be added as the project evolves.

For international competitions, Academic Atlas also records the **national qualifying stages** that feed into them — for example, the TÜBİTAK national olympiads that select Türkiye's teams for the IMO, IPhO, IChO and other international olympiads. Each stage is linked to its international final so students can see the full pathway.

---

## Project Goals

The primary goals of Academic Atlas are to:

* Build a reliable database of international academic opportunities.
* Help students find opportunities that match their interests and goals.
* Maintain consistent, verifiable, and well-organized information.
* Make long-term maintenance easier through standardized data structures.
* Encourage transparency by relying on official sources whenever possible.

---

## Design Principles

Academic Atlas follows a few simple principles:

* Accuracy over speed.
* Quality over quantity.
* Official sources whenever possible.
* Consistent formatting.
* Long-term maintainability.
* Open collaboration.

---

## Repository Structure

```text
academic-atlas/

README.md
CHANGELOG.md
AI_CONTEXT.md
CONTRIBUTING.md

database/
    AcademicAtlas.xlsx

docs/                     (also serves as the GitHub Pages website)
    DatabaseSchema.md
    index.html, style.css, app.js
    data.json             (generated from AcademicAtlas.xlsx)

scripts/
    xlsx_to_json.py       (regenerates docs/data.json)
    validate.py           (checks the database against DatabaseSchema.md)

roadmap/                  (per-release planning notes, e.g. v0.8.0.md)
```

Data integrity is enforced automatically: `scripts/validate.py` checks every record against the schema, and a GitHub Actions workflow (`.github/workflows/data-check.yml`) re-runs it on each pull request and confirms `docs/data.json` is regenerated from the spreadsheet.

The structure may evolve as the project grows, but simplicity and maintainability will always be prioritized.

---

## Data Sources

Whenever possible, information should be collected from:

1. Official organizer websites
2. University websites
3. Official documentation
4. Official FAQs

Third-party websites may be used only for additional context and should never replace official sources.

---

## Contributing

Contributions are welcome.

Before contributing, please ensure that:

* Information is accurate and verifiable.
* Official sources are preferred.
* Existing formatting standards are maintained.
* Major structural changes are documented.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/DatabaseSchema.md`](docs/DatabaseSchema.md) for the full contribution workflow and data schema.

---

## Project Status

Current Version: **v0.8.0**

Current Phase: **Foundation**

The project is currently focused on establishing its core structure before expanding the database.

---

## License

This project is released under the MIT License.
