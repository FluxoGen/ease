# Ease design system

Goal: a calm, trustworthy, fast "go-to" app. Easy to scan in pain, distinctive enough to remember.

## Principles (UX research → decisions)
- **Fewer choices up front (Hick's law).** Home = one search + 6 popular symptoms; the rest grouped under 6 headings.
- **Recognition over recall.** "Tap where it hurts" body figure; picture first on every point page.
- **Thumb reach.** Phone: bottom tab bar (Home, Body, Search, Settings). Desktop: top nav.
- **One color vocabulary.** A color means one thing everywhere (see roles below). No hand-typed hex in components.
- **Act in context.** Pressing time/technique sits beside the picture with a one-tap guided timer.
- **Calm motion.** Micro-interactions only (press states, breathing dot, sheets). The website has no page transitions; the Android app has short slide/fade ones. All motion collapses under reduced-motion.
- **Safety is visible, not scary.** Amber = caution, rose = do not self-press; never red for "informational".
- **Ask when it matters, not before.** The pregnancy question is an optional card and an in-place question on a point that needs it, never a pop-up on first launch.
- **Settings are separate from safety guidance.** Preferences (appearance, pregnancy) live in Settings; Safety is guidance only; About is the app's details.

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

**Dark mode** is a warm charcoal (paper `#191715`, card `#242120`) with the same clay accent as light, not a green-black. Status tints (ok, info, caution, stop) are kept faint so no single hue dominates.

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
- On the website the tab bar tucks away on scroll-down and the floating press bar drops with it (the app keeps its navigation bar fixed).
- Lists lead with where the point is (body area) and what it is used for; the code is a quiet tag.
- Routines that can hide something serious show one shared urgent-care line; the full list is in the Safety guide.
- Screen readers get three timer announcements (started, halfway, finished), not a breath cue every few seconds.
- Not done: markers on the 21 VA handout photos (they carry their own); a drawn knee/ankle on leg views.

## Layout and behavior (as built)
- **`wide` variant** (Tailwind custom): tablet/desktop chrome at width >= 48rem, or short landscape phones
  (height <= 500px, width >= 560px). Phones use the bottom tab bar; `wide` uses the top nav (the app uses a rail).
- **Short-screen rules are in px, not rem.** `rem` in a media query follows the user's font size, so at 2x text a tall
  portrait phone would count as short.
- **Custom variants**: `app:` (only in the Android app layout), `web:` (only on the website), `theme-dark`.
- **Chip rows** use `ChipScroller`: swipeable, edge fades, and it scrolls the selected chip into view only
  when the selection changes (never fights the user's own scrolling).
- **Tab bar** (website) hides on scroll down (`data-nav="hidden"` on `<html>`); `.pressbar` drops with it.
- **Titles**: every route sets a distinct `<title>` (`usePageTitle`).
- **Guided press**: full-screen dialog, 4 s in / 6 s out, wall-clock timer, side switching, wake lock, no vibration.
- **Long words**: headings use `overflow-wrap: anywhere` so large text never causes sideways scroll.
- **Dark mode**: handout photos are dimmed slightly; no pure white surfaces. The switch is one view transition (a
  circle from the tapped control) with all CSS transitions disabled while it runs, so colours change together.
- **Drawings**: the crop window's cut edges fade softly into the card; the marker stays crisp.
- **Motion**: all animation collapses under `prefers-reduced-motion`.

## Android app layout
The app has its own layout (see [android.md](android.md)): a top app bar (logo on Home, title on tabs, back arrow on detail
screens), a pill-indicator navigation bar (a rail on wide screens, hidden on detail screens), a bottom action bar on
detail screens, bottom sheets (body-map result, channel filter), grouped list surfaces, touch ripple, no text selection
and no footer. Large text: bars wrap, labels truncate, headings wrap, nothing scrolls sideways.

See [architecture.md](architecture.md) for how these fit together.
