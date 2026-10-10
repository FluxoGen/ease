# Ease QA

Automated checks for the website, the Android app layout and the Android app on a device. They are plain Node scripts
(Playwright + axe-core) kept in their own package so the app itself stays dependency-light.

```bash
npm run qa:install        # once: installs Playwright, axe-core and pngjs under qa/
npm run qa:web            # website checks   (needs: npm run build && npm run preview)
npm run qa:app            # app layout in a browser (needs: npm run dev)
npm run qa:android        # app on an emulator/device (needs a booted device, see below)
```

Each command prints one line per script (`ok` / `FAIL`) and exits with 1 if anything failed. Run a subset with names:
`npm --prefix qa run web -- flows press`. Reports and screenshots are written to `qa/out/` (git-ignored).

## What each script checks

| Group | Script | Checks |
|---|---|---|
| web | `flows` | Behaviour: guided press (opens Ready, pause/resume/restart), pregnancy question (never blocking; asked in place on a flagged point), pregnancy mode (nothing flagged reachable), Settings, search, body map, list filters, back/scroll, redirects, reduced motion, dark mode |
| web | `audit` | Every route, light/dark, phone/tablet/desktop: axe (WCAG 2.x A/AA + best practice), headings, names, images, links, tap targets, dark-mode glare, console errors, page titles |
| web | `responsive` | 13 viewports (320 to 2560 px) at 100/150/200% text: sideways overflow, off-screen text, tap targets |
| web | `update` | A real service-worker update cycle with no backend: builds v1 and v2, opens v1, deploys v2 under it; the prompt appears, v1 keeps running until Reload, Reload swaps to v2, Later hides it for the session and it is offered again on reopening |
| web | `press` | The guided timer with a fake clock: Ready, Start, Pause/Resume, Restart / Other side / Repeat wait for Start |
| app | `audit` | The app layout (`?app=1`) at 412x915 light/dark, 360x640, landscape, tablet: same checks as web/audit |
| app | `responsive` | The app layout at 13 viewports and 150/200% text, plus: last content can always scroll clear of the fixed bars |
| app | `update` | The update card UI (app and website layouts, dev preview flag): states, Update to downloading to Restart, 44 px buttons, axe, 320 px at 200% text, never above the guided press |
| app | `theme` | System / Light / Dark on the website and the app layout: toggle, persistence, live system change, explicit choice wins, browser-chrome colour |
| android | `suite` | The installed app on a device: first launch, all 441+ screens, back button, press + keep-awake, links to browser/mail, rotation, dark/light, 200% font, 3-button nav, airplane mode, pregnancy, app layout, Settings/Safety/About |
| android | `theme` | Theme choice survives killing the app; explicit choice ignores system changes; status/navigation bar colours and icon colours match |
| android | `coldload` | 25 cold loads: the app must always draw its first screen (no blank screen, none slower than 8 s) |
| android | `sizes` | `tour.mjs` at six screen sizes (320 dp phone to 800 dp tablet, largest display size, foldable) x normal and 2x text x portrait and landscape: layout checks and screenshots |

## Setup per group

- **web**: `npm run build && npm run preview` (serves http://localhost:4173, override with `QA_WEB`).
- **app**: `npm run dev` (serves http://localhost:5183, override with `QA_DEV`). The app layout is only available in dev
  builds, via `?app=1`.
- **android**: boot an emulator (or plug in a device), then `qa/android/install.sh` builds the debug APK and installs it.
  Needs Android Studio's JDK 21 (`JAVA_HOME`). With several devices attached set `ANDROID_SERIAL`. `ADB` overrides the adb path.
  `qa/android/sizes.sh` takes about 20 minutes (it changes the emulator's display size and resets it at the end).
  Use an emulator, not a phone you care about: the scripts clear app data and change system font scale and rotation.

## Reading results

- `web`/`app` scripts print `FINDINGS n` or `total n` (0 is clean); each finding names the viewport, route and element.
- `android` scripts print `PASS`/`FAIL` lines. `tour.mjs` writes screenshots to `qa/out/tour/<label>/`: look at them,
  automated checks do not catch everything (for example a layout that is technically in bounds but wrong).
- Don't edit files in the repo while the `app` group runs: the dev server reloads the page and a script can crash with
  "Execution context was destroyed". Re-run it.
- A transient off-screen flag right after navigating is usually the 240 ms screen-entrance animation; re-run before chasing it.

## Known limits

Emulators only (no real-device runs); one Android version/WebView (Android 17, WebView 153); Firefox is not covered.
