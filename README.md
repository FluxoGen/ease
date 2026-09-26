# Ease

An offline-capable PWA for self-acupressure — pressing points on your own body for common
symptoms (not needle acupuncture). Symptom-first UX: pick what's going on, get a handful of
points with photos and plain-language locations.

## v1 scope

25 points across 10 routines (low back, headaches, neck, sleep, well-being, nausea, stress &
anxiety, menstrual cramps, cold & flu, energy & fatigue), sourced entirely from public-domain
VA patient education handouts (see `sources/`). Five of the ten routines don't have their own
dedicated VA handout — they reuse points already sourced for the other five that are also
commonly cited for these symptoms (cross-checked
against a non-federal source for point selection only, never copied for wording or images — see
each point's own `source` field). No backend — all data is static JSON/TS, bundled for offline
use via a service worker.

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
npm run dev              # dev server at http://localhost:5183, hot reload
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

- `src/data/points.ts` — the 25 points: location, meridian, use tags, pregnancy flag, source,
  classical groupings/Five Phase, body-map placement, verified flag.
- `src/data/routines.ts` — the 10 symptom routines, each a list of point ids.
- `src/data/bodyMap.ts` — the body-map SVG viewBox constant.
- `src/components/BodySilhouette.tsx` — the original schematic body outline used by `/map`.
- `src/pages/` — Home (symptom picker), RoutineDetail, PointDetail, Safety, BodyMap.
- `src/assets/points/` — cropped point photos (JPEG, no VA branding).
- `src/components/EaseLogo.tsx` — the wordmark as inline SVG (paths, no font needed to render it).
- `sources/` — original VA PDFs, kept for provenance.
- `brand-kit/` — the full brand kit (all logo variants, color tokens, favicons, social images,
  usage guidelines). `public/` only has the specific files the app actually serves (favicons,
  PWA icons); anything else — the reversed/mono/tagline logo variants, the Figma-adjacent
  `EaseLogo.jsx` this component was adapted from, `tokens.css` — lives here for reference.

## v2 progress

- **Body map** (`/map`, `src/pages/BodyMap.tsx`) — done. Front/back toggle over an original
  schematic silhouette (`src/components/BodySilhouette.tsx`; not adapted from Wikimedia/Häggström
  in the end — a simple original outline was faster to get right and coordinate against than
  hunting for a matching public-domain front+back pair). Each of the 25 points has a
  `bodyMap: { view, x, y }` placement; hand/foot points cluster tightly at this schematic scale,
  called out directly in the UI rather than hidden.
- **Classical groupings & Five Phase tagging** — done for all 25 points (`classicalGroups`,
  `fivePhase` on `Point`). Only set where genuinely well-established across TCM references —
  Yuan-source, Five-Shu transporting points, Luo-connecting points, the Eight Confluent points,
  the classical Four Command Points, SP6's three-yin-meeting status. Most extra/empirical points
  (Tai Yang, Yin Tang, An Mian, Luo Zhen, Bai Lao, Ling Gu) correctly have neither, since they sit
  outside the 14-meridian system these classifications belong to. Surfaced on `PointDetail`.
- **WHO-361 expansion — infrastructure only, not populated.** `Point.verified: boolean` exists
  and `PointDetail` renders an "unreviewed" warning when false, but every current point is
  `verified: true` — none of the additional ~336 points have been added. Doing that for real
  needs either licensing WHO's dataset or sourcing each new point from multiple independent
  references and having a licensed acupuncturist review it before shipping; that's real
  effort, not something to rush to hit a number. The `verified: false` + body-map-diagram-instead-
  of-fabricated-photo pattern is ready whenever that review pipeline exists.
