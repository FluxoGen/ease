# Ease

An offline-capable PWA for self-acupressure — pressing points on your own body for common
symptoms (not needle acupuncture). Symptom-first UX: pick what's going on, get a handful of
points with photos and plain-language locations.

## v1 scope

~25 points across 5 routines (low back, headaches, neck, sleep, well-being), sourced entirely
from public-domain VA patient education handouts (see `sources/`). No backend — all data is
static JSON/TS, bundled for offline use via a service worker.

Deliberately **not** v1: the full WHO 361-point set. That set has real value but the WHO
locations/names carry a CC BY-NC style license that's awkward for a paid app, and the point
data would need an acupuncturist's review before shipping (`verified: false` gate). Expanding
toward it is the natural v2.

## Data provenance & licensing

Point selection, groupings, safety cautions, and photos are adapted from six PDFs published by
the VA Portland Health Care System / VHA Office of Patient Centered Care — U.S. federal works,
public domain under 17 U.S.C. §105. Originals are kept in `sources/` for reference. Photos were
cropped to remove all VA branding/seals; instructional copy was paraphrased rather than copied
verbatim.

Facts (a given point's traditional name and location) are not copyrightable; specific wording
and imagery from other publishers (WHO, textbooks, other apps) were deliberately avoided.

## Non-negotiables

- **Pregnancy is a hard block, not a footnote.** Three points (LI4, SP6, UB60) are traditionally
  avoided during pregnancy. If a user marks themselves pregnant/unsure, those points show a
  warning instead of instructions — see `src/context/PregnancyContext.tsx` and the
  `pregnancyCaution` flag in `src/data/points.ts`.
- **Wellness language only.** "Traditionally used for," never "treats" or "cures" — this is
  patient education, not a medical device.
- No VA branding anywhere in the shipped app.

## Running it

Requires Node 18+ (developed against Node 22).

```bash
npm install
npm run dev              # dev server at http://localhost:5173, hot reload
```

The dev server does **not** register a service worker — `vite-plugin-pwa` only generates one on
a production build. To actually exercise offline behavior (or just to see what a real install
looks like), build and serve the built output instead:

```bash
npm run build            # tsc -b && vite build → dist/, also generates dist/sw.js
npm run preview          # serves dist/ at http://localhost:4173 with the service worker active
```

To verify offline mode manually: load `http://localhost:4173/` once with the network on (lets
the service worker install and precache), then in DevTools → Network, switch to "Offline" and
reload. The whole app — including point photos — should keep working; only genuinely uncached
routes would fail.

Other scripts:

```bash
npx tsc --noEmit         # type-check without emitting
npm run lint             # oxlint
```

### Gotchas hit while building this

- **`create-vite` refuses a non-empty directory.** Scaffold into a throwaway temp dir and copy
  the files in, rather than passing `--overwrite` at the project root (that flag deletes existing
  files first, including anything already committed).
- **`vite-plugin-pwa`'s `globPatterns` is an explicit allowlist.** If you add a new asset
  extension (this project switched point photos from `.png` to `.jpg` partway through), it has
  to be added to `globPatterns` in `vite.config.ts` too, or the service worker silently stops
  precaching those files — no error, no warning, they're just missing offline. Worth reloading
  offline after any asset-pipeline change to catch this.
- **No headless-browser CLI was preinstalled here.** Testing in an actual browser (not just
  `tsc`/`vite build` succeeding) needed `npm install playwright` + `npx playwright install
  chromium` in a scratch directory, then a small driver script (`chromium.launch()` →
  `page.goto()` → assert/screenshot). Worth doing this after any UI change — a clean build and a
  clean typecheck both pass even when a route 404s or a component throws at runtime.

## Structure

- `src/data/points.ts` — the 25 points: location, meridian, use tags, pregnancy flag, source.
- `src/data/routines.ts` — the 5 symptom routines, each a list of point ids.
- `src/pages/` — Home (symptom picker), RoutineDetail, PointDetail, Safety.
- `src/assets/points/` — cropped point photos (JPEG, no VA branding).
- `sources/` — original VA PDFs, kept for provenance.

## Open items for v2

- Body-map view: PD Wikimedia (Häggström) SVG outlines with point dots overlaid, for a
  browse-by-region experience instead of routine-only.
- Expand toward the WHO 361-point set, each new point flagged `verified: false` until reviewed
  by a licensed acupuncturist.
- Classical point groupings (Yuan-source, Back-Shu, Five Shu, etc.) and Five Phases tagging —
  straightforward additions to `Point` once there's a reason to surface them in the UI.
