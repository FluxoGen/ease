# Ease

<a href="https://github.com/FluxoGen">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/FluxoGen/.github/main/assets/badge-dark.png" />
    <img alt="A product of FluxoGen" src="https://raw.githubusercontent.com/FluxoGen/.github/main/assets/badge-light.png" height="40" />
  </picture>
</a>


**Live:** https://ease-murex.vercel.app

Ease is an offline-capable PWA for self-acupressure: pressing points on your own body for everyday
symptoms (not needle acupuncture). It is symptom-first. Pick what is going on, get a short routine of
points, each with a drawing, a plain-language way to find it, and a guided timer.

Wellness education only. Not medical advice. Language is "traditionally used for", never "treats".

## At a glance

| | |
|---|---|
| Library | **412 points**: all 361 WHO (2008) standard points, 49 extra points, 2 VA handout zones |
| Evidence tiers | 351 match the WHO standard · 50 cross-checked references · 9 disputed · 2 VA zones |
| Routines | **23** symptom routines, built automatically from point tags |
| Pictures | 19 original body-view drawings (placed by WHO cun measurements) + 21 VA handout photos |
| Safety | 45 points pregnancy-flagged, 16 reference-only (never pressable), 78 gentle-touch |
| Stack | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, react-router 7, Headless UI, vite-plugin-pwa |
| Backend | none; static data, works offline |
| Review status | **not yet reviewed by a licensed acupuncturist** (stated on the Safety page) |

## Features

- **Search-first home**: symptoms, body parts, point names/codes and everyday phrases ("can't sleep").
- **Body map** (`/map`): tap where it hurts (front/back) to see that area's symptoms and points.
- **All points** (`/points`): search plus area and channel filters over the whole library.
- **Point page**: picture, "Find it", technique, cautions, evidence chip, and a **guided press**
  (full-screen timer, 4 s in / 6 s out breathing dot, side switching, screen wake lock, next-point hand-off).
- **Pregnancy gate**: users say once whether they are pregnant or not sure; flagged points then show a
  warning instead of instructions, everywhere.
- **Safety page**: urgent signs, pressing rules, color legend, how locations were checked.
- **PWA**: installable, fully offline after first load (~46 precached files, about 2 MB).
- **Light and dark**, responsive from small phones to desktop, large-text safe, WCAG AA contrast.

## Quick start

Requires Node 18+ (developed on Node 22) and Python 3 (library scripts only, no packages).

```bash
npm install
npm run dev        # http://localhost:5183 (no service worker in dev)
npm run build      # tsc -b && vite build -> dist/ (+ service worker)
npm run preview    # serves dist/ at http://localhost:4173 with the service worker
npm run lint       # oxlint
npm run check      # library rules check + WCAG contrast check
npx tsc -b         # type-check only
```

**Use `tsc -b`, never bare `tsc --noEmit`.** The root `tsconfig.json` is solution-style (`files: []` plus
references), so bare `tsc --noEmit` checks zero files and exits 0.

Test offline: open the preview once online, then DevTools > Network > Offline and reload.

Dev-only route `/atlas-dev` draws all 19 views with every point labelled, for visual placement checks.

## Repository map

```
src/
  main.tsx, App.tsx        routes, shell (header, tab bar, footer, pregnancy gate)
  pages/                   Home, RoutineDetail, PointDetail, AllPoints, BodyMap, Safety
  components/              PointCard/Row/Picture, PressSheet, BodyFigure, BottomNav, ui/*
  components/atlas/        drawings (art.tsx), landmarks (geometry.ts), placer (place.ts)
  data/library/            points.json (generated), index.ts, shared.ts, areas.ts, photos.ts
  data/                    routines.ts, search.ts, nav.ts, groups.ts
  context/, hooks/         pregnancy state, page titles
scripts/                   assemble_library.py, check_library.py, unit_audit.py,
                           review_sheet.py, import_review.py, contrast_check.mjs
sources/                   VA PDFs + every research, verification and review record
docs/                      architecture.md, design-system.md, library-pipeline.md,
                           placement-vocab.json, history.md
```

Deeper detail: **[`docs/architecture.md`](docs/architecture.md)**.

## The point library

`src/data/library/points.json` is **generated, never hand-edited**. It is built from research records in
`sources/library-research/` by `scripts/assemble_library.py`, then gated by `scripts/check_library.py`.

```bash
python3 scripts/assemble_library.py   # research + verification -> points.json
python3 scripts/check_library.py      # rules check, exits 1 on any problem
python3 scripts/unit_audit.py <who_entries.json>   # distance wording vs WHO cun values
```

What makes it trustworthy (full rules in [`docs/library-pipeline.md`](docs/library-pipeline.md)):

- WHO 2008 is the location authority. Wording is always paraphrased.
- A second, different model re-verifies every record against a fresh source.
- Non-WHO points need at least two independent references; every indication needs at least two sources.
  Flashcard and study sites do not count.
- Repeated text (techniques, cautions, pressing rules, source names, the review statement) lives once in
  `src/data/library/shared.ts` and is referenced by id.
- Points that cannot be self-pressed (over the carotid, nipple, inside the mouth) stay as reference only.

### Licensed acupuncturist review (open item)

`sources/review/acupuncturist-review.csv` lists every point, most important first (safety, pregnancy,
disputed first). A reviewer fills the `REVIEW_` columns, then:

```bash
python3 scripts/import_review.py filled.csv "Name, L.Ac." 2026-11-01
python3 scripts/assemble_library.py && python3 scripts/check_library.py
```

Signed-off points show "Reviewed by ..."; rejected ones become "References differ" with the note.
Regenerate the sheet with `python3 scripts/review_sheet.py > sources/review/acupuncturist-review.csv`.

## Design

One semantic token system in `src/index.css` (spec: [`docs/design-system.md`](docs/design-system.md)). No component
hard-codes a color. Color meaning: green = matches WHO, blue = cross-checked, amber = caution,
rose = reference only / do not self-press (red is never used for information).

## Deploy

Vercel auto-deploys `main` (`vercel.json` rewrites all paths to `index.html` so deep links work). Any static
host works: `npm run build` and serve `dist/` with an SPA fallback.

## Quality checks

`npm run check`, `npx tsc -b`, `npm run lint` and `npm run build` are the repo-level gates.
Browser QA (Playwright on Chromium and WebKit, axe-core, a 13-viewport sweep, all 412 pages, timer flows)
was run before each release but **those scripts are not in this repo**. Not yet tested: Firefox, and
vibration/wake-lock on a real device (vibration was removed on purpose).

## Development gotchas

- `vite-plugin-pwa` `globPatterns` is an allowlist. A new asset extension must be added in `vite.config.ts`
  or it silently stops being cached offline.
- Tailwind `@custom-variant` with comma-separated media queries is dropped silently; the `wide` variant is
  written in block form for that reason.
- A clean build does not prove a route renders. Click through in a real browser after UI changes.

## Known gaps

- No licensed acupuncturist review yet.
- Markers are missing on the 21 VA handout photos (they carry their own); leg drawings have no drawn knee/ankle.
- Browser QA scripts are outside the repo.
- Older history: [`docs/history.md`](docs/history.md).

## Ownership and legal

Ease is a product of **[FluxoGen](https://github.com/FluxoGen)** and is © 2026 FluxoGen. All rights reserved; see
[`LICENSE`](LICENSE). The source is public for transparency and review, not reuse or redistribution.

Third-party material: VA handout photos are U.S. government works (public domain, originals in `sources/`).
Point locations were checked against published standards and described in our own words.

---

<a href="https://github.com/FluxoGen">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/FluxoGen/.github/main/assets/footer-dark.png" />
    <img alt="FluxoGen — From spark to arc." src="https://raw.githubusercontent.com/FluxoGen/.github/main/assets/footer-light.png" width="100%" />
  </picture>
</a>

<p align="center"><sub>© 2026 FluxoGen. Built with care — from spark to arc.</sub></p>
