# Ease design system

Goal: a calm, trustworthy, fast "go-to" app. Easy to scan in pain, distinctive enough to remember.

## Principles (UX research → decisions)
- **Fewer choices up front (Hick's law).** Home = one search + 6 popular symptoms; the rest grouped under 6 headings.
- **Recognition over recall.** "Tap where it hurts" body figure; picture first on every point page.
- **Thumb reach.** Phone: bottom tab bar (Home, Body, Search, Safety). Desktop: top nav.
- **One color vocabulary.** A color means one thing everywhere (see roles below). No hand-typed hex in components.
- **Act in context.** Pressing time/technique sits beside the picture with a one-tap guided timer.
- **Calm motion.** Micro-interactions only (press states, breathing dot, sheets). No page transitions.
- **Safety is visible, not scary.** Amber = caution, rose = do not self-press; never red for "informational".

## Signature: the dot
The logo's acupoint dot with two rings. Used as the active-tab marker, the breathing visual in the
guided press, the body-map tap marker and the point marker on drawings.

## Color roles (tokens in `src/index.css`; light / dark)
| Role | Token | Use |
|---|---|---|
| Page | `paper` | background |
| Card | `card`, `card-2` | raised / recessed surfaces |
| Text | `ink`, `ink-2`, `ink-3` | primary, secondary, tertiary (never for essential text) |
| Border | `line`, `line-strong` | hairlines |
| Brand accent | `accent` | the dot, rings, active markers (decorative) |
| Main action | `accent-strong` + `on-accent` | one primary button per screen, links |
| Verified | `ok` | matches WHO standard, reviewed |
| Cross-checked | `info` | 2+ independent references |
| Caution | `caution` | pregnancy, artery, light touch, references differ |
| Stop | `stop` | reference-only: not for pressing yourself |
All text/background pairs meet WCAG AA (checked by `scripts/contrast_check.mjs`).

## Type
Manrope (self-hosted variable, so it works offline). Display 32/36 800, title 22 700, body 16/1.6,
small 14, caption 12. Codes use tabular numerals.

## Shape & space
Cards 20px radius, buttons 14px, chips pill. 4px grid. Touch targets >= 44px.

## Decisions from the independent UX review
- Reference-only points get a rose crossed marker on the drawing (never the clay "press here" dot) and the
  stop notice sits directly under the title; the green evidence chip is hidden on those pages.
- Clay is for the dot and the one main action. Source chips and "used for" tags are neutral.
- A point page belongs to the tab it was opened from; the back link names the previous screen.
- The tab bar tucks away on scroll-down; the floating press bar drops with it.
- Lists lead with where the point is (body area) and what it is used for; the code is a quiet tag.
- Routines that can hide something serious show one shared urgent-care line; the full list is on Safety.
- Screen readers get three timer announcements (started, halfway, finished), not a breath cue every few seconds.
- Not done: markers on the 21 VA handout photos (they carry their own); a drawn knee/ankle on leg views.

## Layout and behavior (as built)
- **`wide` variant** (Tailwind custom): tablet/desktop chrome at width >= 48rem, or short landscape phones
  (height <= 31.25rem, width >= 35rem). Phones use the bottom tab bar; `wide` uses the top nav.
- **Chip rows** use `ChipScroller`: swipeable, edge fades, and it scrolls the selected chip into view only
  when the selection changes (never fights the user's own scrolling).
- **Tab bar** hides on scroll down (`data-nav="hidden"` on `<html>`); `.pressbar` drops with it.
- **Titles**: every route sets a distinct `<title>` (`usePageTitle`).
- **Guided press**: full-screen dialog, 4 s in / 6 s out, wall-clock timer, side switching, wake lock, no vibration.
- **Long words**: headings use `overflow-wrap: anywhere` so large text never causes sideways scroll.
- **Dark mode**: handout photos are dimmed slightly; no pure white surfaces.
- **Motion**: all animation collapses under `prefers-reduced-motion`.
See [architecture.md](architecture.md) for how these fit together.
