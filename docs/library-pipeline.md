# Point library pipeline

Goal: an exhaustive, trustworthy library of self-acupressure points. Every point has a short way to
find it, a picture, and how to press it. Nothing is invented. Every fact traces to a source, and any
text that repeats lives in one place and is referenced by id.

The work runs in phases. A phase only starts when the previous phase's **gate** passes.

| Phase | What | Who | Gate (must pass to continue) |
|---|---|---|---|
| 0. Reference | Split the WHO 2008 standard into one entry per point (361). Freeze the vocabulary below. | lead | 361/361 entries parsed; vocabulary frozen |
| 1. Research | Per channel batch, write one record per point: lay location, placement spec, technique, safety, indications, sources. | author agents | Schema check passes; ≥1 independent source per point besides WHO; ≥2 sources for every indication |
| 2. Verify | A different agent re-checks every record against the WHO entry and a fresh source, without seeing the author's sources first. | verifier agents (different model) | Every disagreement resolved or the point is marked `disputed` |
| 3. Place | A deterministic placer turns each placement spec into a dot on a region drawing. | lead (code) | Every point renders inside its drawing; a visual sweep of every crop finds no misplaced dot |
| 4. Assemble | Merge into `src/data`, dedupe text into shared tables, map indications to symptom routines. | lead | Type check, lint, build, and data-consistency checks pass |
| 5. Ship | Browser test on phone width, light and dark; PR. | lead | No console errors; deep links work; PR merged |

## Anti-hallucination rules

1. The WHO entry is the location authority. A record may not contradict it. Where WHO lists an
   alternative or is silent (GV15, ST44 text missing in the scan), the record says so.
2. Location text is written in plain words and paraphrased. WHO wording is never copied.
3. Agents only cite pages they actually opened. Unopened search snippets don't count.
4. An indication (what a point is traditionally used for) needs at least 2 independent sources.
   Indications are traditional uses, never cure claims.
5. A point that cannot be safely pressed by yourself stays in the library for reference, marked
   `avoid`, with no technique and no routine.

## Vocabulary (frozen)

### Techniques: `technique`
| id | Shown to the user | Default time |
|---|---|---|
| `circle` | Press with a thumb or fingertip and make small, slow circles | 1 minute |
| `press` | Press steadily with a thumb or fingertip and hold | 30–60 seconds |
| `knead` | Squeeze and knead the muscle between thumb and fingers | 1 minute |
| `nail` | Press with the edge of a fingernail, on and off | 10–20 presses |
| `gentle` | Light fingertip pressure in tiny circles; never press hard | 30 seconds |
| `ball` | Lean against a tennis ball on a wall, or ask someone to press | 1 minute |

### Self-care: `selfCare`
`ok` normal pressure · `gentle` light pressure only (face, eye area, throat, over a pulse) · `avoid`
not for self-pressing (reference only).

### Cautions: `cautions` (ids, text lives in one shared table)
`pregnancy` · `pulse` (an artery runs here; press beside the pulse, not on it) · `eye` (stay on the
bone, never press the eyeball) · `throat` (light touch only) · `broken_skin` is global, not per point.

### Views: `view`
`foot-top`, `foot-inner`, `foot-outer`, `foot-sole`, `hand-palm`, `hand-back`, `arm-inner`,
`arm-outer`, `leg-front`, `leg-inner`, `leg-outer`, `leg-back`, `torso-front`, `torso-side`, `back`,
`face-front`, `head-side`, `head-back`, `head-top`.

### Placement spec: `place`
One of:
- `{ "at": "<landmark>" }`
- `{ "from": "<landmark>", "up": n, "down": n, "out": n, "in": n }` in cun (thumb-widths). On limbs,
  `up` means toward the trunk.
- `{ "line": "<channel line>", "from": "<landmark>", "cun": n }` along a channel line on that view.
  Positive `cun` = toward the trunk/head, negative = away from it. On limb views `out` = toward the
  outer edge (thumb side of the arm, little-toe side of the leg). On `head-top`, `up` = toward the back
  of the head; on `head-back`, toward the crown.
- `{ "between": ["<landmark>", "<landmark>"], "frac": 0..1 }`
- `{ "manual": "<one sentence>" }` only when none of the above fits (fingers, toes, ear, face detail).

Landmark and line ids are listed in `placement-vocab.json`.

### Symptom tags: `tags`
Existing: `low_back_pain`, `headache`, `neck_pain`, `sleep`, `well_being`, `nausea`,
`stress_anxiety`, `menstrual_cramps`, `cold_flu`, `energy_fatigue`, `upper_back`,
`shoulder_tension`, `eye_strain`, `ear_hearing`, `digestive_health`, `hand_wrist_strain`,
`foot_ankle_strain`.
Candidates (a routine is only created if enough well-sourced points land in it): `toothache_jaw`,
`nose_sinus`, `cough_breathing`, `knee_pain`, `hip_leg_pain`, `constipation`.
