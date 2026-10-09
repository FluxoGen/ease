# Sources and provenance

Everything the library was built from, kept so any fact can be traced.

| Path | What |
|---|---|
| `*.pdf` | Five VA Portland / VHA patient-education handouts (headaches, low back, neck, sleep, well-being). U.S. government works, public domain. Source of the 21 handout photos and the VA core of five routines. |
| `library-research/authors/` | Phase 1 author records per channel batch |
| `library-research/verify/` | Phase 2 verifier verdicts and fixes (V1-V9) |
| `library-research/positions.json` | Hand-checked dot positions for points the placer cannot derive |
| `library-research/lead_fixes.json` | Corrections found by the unit audit, applied after verifier fixes |
| `library-research/pregnancy_audit.json`, `caution_check.json` | Pregnancy and caution audits |
| `library-research/verify_ex_units.json` | Unit check for extra points |
| `library-research/review.json` | Created by `scripts/import_review.py` after an acupuncturist signs off (absent until then) |
| `location-cross-check/` | Earlier cross-check of the first 76 points and of the VA points (A-D, E, F pregnancy) |
| `review/acupuncturist-review.csv` | Sheet for the licensed acupuncturist, most important rows first |

Rules: WHO 2008 is the location authority; wording is paraphrased; flashcard sites are not sources.
See [`docs/library-pipeline.md`](../docs/library-pipeline.md). Do not edit `src/data/library/points.json`
by hand; change records here and re-run `scripts/assemble_library.py`.
