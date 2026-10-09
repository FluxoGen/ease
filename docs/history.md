# Project history

> **Historical record.** This is how Ease grew from 25 points to the current 412. File names, counts
> and data shapes below (`src/data/points.ts`, `PointDiagram`, `BodySilhouette`, `verified: false`) describe
> older versions and **no longer exist**. For the current state, read [`README.md`](../README.md) and
> [`architecture.md`](architecture.md). It is kept because the reasoning (why unverified points were
> surfaced, what the cross-checks found) is still useful.


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
  (Tai Yang, Yin Tang, An Mian, Luo Zhen, Bai Lao) correctly have neither, since they sit
  outside the 14-meridian system these classifications belong to. Surfaced on `PointDetail`.
- **WHO-361 expansion — started, first batch of 19 points added (`verified: false`).** 25 -> 44
  points, spanning three channels this app had zero coverage of before (Governing Vessel,
  Conception Vessel, Triple Energizer): GV20, GV26, CV4, CV6, CV12, CV17, BL23, BL25, GB30, GB34,
  SP9, SP10, ST25, KD3, PC8, LU9, LI20, TE5, and EX-B2 (the Huatuojiaji paraspinal line,
  represented as one region like `ub_low_back_lines` rather than the ~34 individual points it
  technically is). Each location was cross-referenced across multiple independent TCM
  references — never copied from a single source's exact wording, and never from WHO's own
  Standard Acupuncture Point Locations text directly (that carries a restrictive license). No
  photos: `Point.image` is optional now, and `PointDetail`/`RoutineDetail` fall back to
  `PointDiagram` (a zoomed crop of the same body-map silhouette with the point marked) instead of
  fabricating a stock photo. At the time, these 19 were kept out of the 10 curated routines
  (`useTags: []`) — see the "Discoverability rework" note further down for why that changed.
  They're reachable via `/map` (shown as a dashed dot, distinct from both the solid "confirmed"
  dot and the pregnancy-caution ring) or a direct `/point/:id` link, and `PointDetail` shows a
  persistent "not yet reviewed by a licensed acupuncturist" notice on all of them.

  Two of the nineteen (CV4, CV6) got `pregnancyCaution: true` — lower-abdomen points are
  consistently cited as pregnancy-contraindicated across acupressure safety sources, same
  standing as LI4/SP6/UB60.

  **Batch 2 (44 -> 68):** organized around completing whole classical sets rather than picking
  points at random — this now has **all eight** of the Eight Confluent points (SP4, KD6, BL62,
  GB41 joined the four already in the app), three more Back-Shu points (BL13 Lung, BL18 Liver,
  BL20 Spleen — forming a visibly correct vertical line on the body map, next to BL23/BL25),
  GV14 Dazhui (the other major all-Yang-channels meeting point besides GV20), two more Front-Mu
  points (LR13, LR14), and the remaining Five-Shu transporting points for six channels that only
  had one or two of their five before (Liver, Stomach, Spleen, Heart, Kidney, Pericardium, Lung).

  **Batch 3 (68 -> 85):** completed two more whole classical sets. All **twelve** Jing-Well
  points now exist (LI1, SI1, ST45, BL67, GB44, TE1 joined KD1/HT9/SP1 for the yang/yin split;
  LR1, LU11, PC9 completed the yin side) — this is the classical "twelve Jing-Well points" set
  used for emergency/resuscitation stimulation, a clean and bounded target. All **twelve**
  Back-Shu points now exist too (BL14 Pericardium, BL15 Heart, BL19 Gallbladder, BL21 Stomach,
  BL22 Triple Energizer, BL27 Small Intestine, BL28 Bladder joined the five from batches 1-2) —
  visibly forms the correct vertical spine line on the body map, now dense enough that the UI's
  existing "points sit close together at this scale" note is doing real work. Also added GV4
  Mingmen, one of the most classically significant points on the Governing Vessel, adjacent to
  the Kidney Back-Shu point.

  **Batch 4 (85 -> 101):** completed the remaining two Five-Shu categories. All **twelve**
  Shu-Stream points now exist (LI3, ST43, BL65, TE3 joined the eight already in the app) and all
  **twelve** He-Sea points now exist (KD10, SI8, TE10 joined the nine already there) — meaning
  three of the five full Five-Shu categories are now complete (Jing-Well, Shu-Stream, He-Sea);
  Ying-Spring and Jing-River still have gaps. Also added nine well-known clinical points outside
  the classical categories: LI15 (shoulder), ST6 (jaw), BL2 (eyebrow, common headache point),
  BL10 (neck), TE17 (behind the ear), GB14 (forehead), GB1 (outer eye), SI11 (shoulder blade),
  SI19 (in front of the ear).

  ~260 points still to go. Same process every batch: cross-reference facts across independent
  sources via web search, never fabricate a location, never claim a photo that doesn't exist,
  keep `verified: false` until someone who isn't an AI actually checks it.

- **Discoverability rework — the "keep unverified points out of routines" call was wrong.**
  Feedback after batch 4 (stopped at 101 points, 76 of them pending review): with those 76
  reachable *only* via `/map`'s tiny dots, dense clustering meant a human genuinely couldn't
  perceive that 100+ things were even there, and there was no way to browse by symptom at all —
  correctly called out as "adding points nobody can use." Two structural fixes, not more data:

  - **`/points` — a searchable, filterable directory of every point.** Search by name, filter by
    meridian or by verified/pending, each row shows a thumbnail (photo or `PointDiagram`) and a
    "Pending" badge. This is the only way to reach a few genuinely specialized points (e.g. GV26,
    an emergency-resuscitation point with no natural fit in a self-care symptom list) — those get
    `useTags: []` on purpose and are tracked in `NO_ROUTINE_EXCEPTIONS` in the QA script so that's
    a deliberate choice, not a gap.
  - **7 new routines, and unverified points folded into existing ones where a real link exists.**
    Upper & Mid Back, Shoulder Tension, Eye Strain, Ear & Hearing, Digestive Health, Hand/Wrist &
    Elbow, Foot & Ankle — 10 routines -> 17. Where a routine already had a `sourceUrl` (an actual
    VA handout), the honest move was a new `Routine.extraNote` field alongside it, not silently
    stretching what the handout covers: `extraNote` names exactly which points are the VA-sourced
    core and which are additional pending-review points folded in. Every point list item also now
    shows a "Not yet reviewed" label inline (`RoutineDetail`), so a mixed routine like Foot & Ankle
    is legible at a glance — real photos for KD1/UB60/LR3, diagrams-with-a-badge for the rest —
    without needing to open each point to find out which tier it's in.
  - **`PointDiagram` got actual landmarks.** The earlier version was a bare zoomed crop of the
    silhouette — fair complaint that it didn't help orient anyone, since any crop of a plain
    rounded-rect limb looks the same regardless of *which* limb. Added dashed joint-landmark ticks
    (shoulder/elbow/wrist/hip/knee/ankle) to `BodySilhouette`'s shared paths, plus a region + view
    label printed above the diagram on `PointDetail` ("ANKLE · BACK VIEW").
  - Retagging ~95 points by hand risked transcription slips, so it was done with a small script
    (`retag.mjs`, not shipped — scratch tooling) mapping id -> final `useTags` array and applying
    it in one pass, then re-run through the same data-consistency check every batch has used.
  - This surfaced the `tsc --noEmit` no-op documented above — a real bug (`ROUTINE_ICONS` missing
    keys for the 7 new categories) that the routine-but-broken typecheck step had been silently
    missing; `npm run build`'s `tsc -b` caught it immediately once actually invoked.

## Region illustrations for unreviewed points

The 76 `verified: false` points have no licensed photo. A search for openly licensed per-point
imagery found nothing usable: Wikimedia Commons covers about a dozen points (mostly CC BY-SA),
Wellcome's CC BY charts are antique woodcuts, a clinic site's per-point diagrams
(CC BY-SA 4.0) are full-body silhouettes with dots — at least one (BL-53) wrongly placed — and
3D-atlas projects reuse a one-person coordinate set. So these are original illustrations drawn for
Ease, placed from the same landmark descriptions as each point's `location` text. They are
**approximate** and every point stays `verified: false` until a licensed acupuncturist checks
placement. `PointDetail` captions them "Illustration, not a photo".

## Location cross-check (76 unreviewed points)

Each unreviewed point's location was checked against the WHO Standard Acupuncture Point Locations
(2008, read as OCR text from archive.org) plus two or more TCM education references. Raw results,
sources and verdicts: `sources/location-cross-check/result_{A,B,C,D}.json`.

Outcome: 39 confirmed, 33 wording fixes, 4 outright errors (LU11 named the wrong thumb edge, BL27
was placed at the wrong level, BL65 named the wrong end of the 5th metatarsal, LR13 named the 12th
rib instead of the 11th) — all corrected in `points.ts`, with dot positions adjusted to match.

Limits to know about: the "independent" sources largely share one textbook lineage, so this is a
solid check against the WHO standard, not three fully separate opinions. The WHO text for ST44 was
missing from the OCR, so ST44 rests on education sources only. WHO itself lists LI20, PC8 and PC9
as unsettled, and sources differ on GB41, ST43, KD10 and GV26. EX-B2 is an extra point outside WHO's
361, so it has no WHO anchor and is the lowest-confidence entry. Nothing here replaces review by a
licensed acupuncturist — every point stays `verified: false`.

## Full-repo audit (all points)

- **VA-sourced points re-checked** (`sources/location-cross-check/result_E_va_points.json`). Most
  matched the WHO standard. Fixes: SI4 text said "palm side" (it's the little-finger edge); Bai Lao,
  An Mian and the UB low-back lines had imprecise locations and were rewritten.
- **Removed:** *Ling Gu* (a Master Tung point only one school recognizes, with a location that
  conflicted with its own school's, and a pregnancy contraindication) and *Hip Area* (a general
  zone, not a defined point). The app now has 99 points: 23 with VA photos, 76 with illustrations.
- **Non-WHO entries are labelled** in their source line: An Mian (modern empirical extra point).
  Bai Lao is a recognized extra point (EX-HN15). The ear low-back zone is a recognized
  auricular zone (lumbosacral).
- **Pregnancy flags** (`sources/location-cross-check/result_F_pregnancy.json`): GB21 (explicit in
  6+ sources), BL67, BL27, BL28 added. Now 9 flagged points (LI4, SP6, BL60, GB21, BL67, BL27,
  BL28, CV4, CV6) — Ling Gu was also flagged before it was removed. Abdominal/lumbosacral points
  where sources only urge caution (ST25, CV12, BL23, BL25, GV4) are not flagged; the "not listed"
  evidence for the other points is weak (mostly one source), not proof of safety.
