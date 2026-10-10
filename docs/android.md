# Android app

Ease ships on Android as a [Capacitor 8](https://capacitorjs.com) app: the same React build, bundled into the
APK and shown in an Android WebView. There is no server and no network use: every file is inside the app, and
the app does not even hold the `INTERNET` permission.

```mermaid
flowchart LR
  SRC["src/ (same code as the website)"] -->|npm run build:native| DIST["dist/ (no service worker)"]
  DIST -->|npx cap sync android| ASSETS["android/app/src/main/assets/public"]
  ASSETS --> APK["APK / AAB"]
  APK --> WV["Android WebView at https://localhost (served from the APK)"]
```

## Requirements

- Node 22, npm.
- Android Studio (Ladybug or newer) with Android SDK 36. Its bundled JDK 21 is used for Gradle.
- A device or emulator on Android 7.0 (API 24) or newer.

## Everyday workflow

```bash
npm run android        # build:native + cap sync + open Android Studio, then press Run
npm run android:sync   # rebuild the web part and copy it into android/ (Studio already open)
```

`npm run build:native` is `tsc -b && vite build --mode native`. Native mode turns off the PWA service worker:
the APK already holds every file, and a second cache would only risk serving old files after an update.
Always sync after a web change; the APK only contains what was synced.

If Android Studio shows **Gradle: Build Error** right after opening the project, the usual cause is the Gradle JDK:
Capacitor 8 needs JDK 21, and a system Java 17 is not enough. In Studio open Settings > Build, Execution, Deployment >
Build Tools > Gradle and set **Gradle JDK** to the embedded JDK (`jbr-21`), then File > Sync Project with Gradle Files.

Command-line builds (no Studio):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd android && ./gradlew assembleDebug        # app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## The app layout (not the website)

In the app the UI is a dedicated layout, not the website in a wrapper. It is switched on by `isApp` in
`src/native.ts` (always on in the Android app; in `npm run dev` add `?app=1` to preview it in a browser; never on in a
production website build). `<html data-app>` is set before the first render, and the Tailwind `app:` variant
(`src/index.css`) applies only under it, so the website's classes and behaviour are unchanged.

| Website | App |
|---|---|
| Logo header on every page, big page headings | Top app bar: logo on Home, a title on each tab, a back arrow on detail screens (the title fades in when you scroll) |
| Dot-style tab bar that hides on scroll; desktop top nav | Material navigation bar with a pill indicator; a rail on tablets and in landscape; hidden on detail screens |
| "‹ Home" text link, footer with links | System-style back arrow; no footer (About, version, privacy and feedback live under the Settings tab) |
| Cards with their own borders | One rounded surface per list, with dividers |
| Pregnancy question as a pop-up | An optional card on Home; a flagged point asks in place; the answer is changed in Settings |
| Inline "Start routine / Start press" buttons | Bottom action bar on detail screens |
| Body-map result under the figure; `<select>` for channels | Bottom sheets (body-map result, channel filter) |
| Hover and focus styles | Touch ripple, press states, no text selection, no overscroll glow |
| Pages swap instantly | Short slide/fade transitions (none for reduced motion) |

Code: `src/components/app/` (`AppChrome.tsx` bar and nav, `barContext.ts`, `BarSpacer.tsx`, `ChannelSheet.tsx`), `AppLayout` in
`src/App.tsx`, `initRipple` in `src/native.ts`. A detail screen gives the bar its title with `<AppBarTitle>`.
System back also closes a bottom sheet (`data-back-closes`) before leaving the screen.

### Screen sizes and large text

- The short-screen rules (landscape phones) are written in **px**, not rem: `rem` inside a media query follows the system
  font size, so at 2x text a tall portrait phone would count as "short".
- The bottom action bars wrap at large text and `BarSpacer` reserves their real height; the navigation bar truncates
  labels instead of overflowing; headings wrap instead of breaking mid-word.
- The guided press pins its Start/Pause row to the bottom of the screen, and uses a side-by-side layout on a short,
  wide screen.
- Tested (emulator): 320 dp to 800 dp wide, the largest display-size setting, a foldable-sized screen, 1x and 2x text,
  portrait and landscape (`qa/android/sizes.sh`). Known limit: on a very short landscape phone at 2x text the point
  screen is cramped but scrollable.

## What is native, and where

| Concern | How | Where |
|---|---|---|
| Back button / gesture | Closes the guided press, then goes back in the WebView's own history (Capacitor's `canGoBack`), then Home, then backgrounds the app. | `src/native.ts`, `src/App.tsx` |
| Links that leave the app | `http(s)` links to other hosts open in a browser Custom Tab (`@capacitor/browser`); `mailto:` hands off to the mail app. The app WebView never leaves `https://localhost`. | `src/native.ts` |
| Screen stays on during a press | `@capacitor-community/keep-awake` (Android WebView has no Wake Lock API); released on pause, finish or close. Only the latest request can release it, so a quick pause/resume never lets the screen sleep mid-press. | `src/native.ts`, `PressSheet.tsx` |
| Splash | Android 12 splash API: paper background + Ease mark; hidden after the first render, with a 3 s fallback so it can never stick. | `res/values/styles.xml`, `res/drawable/splash_icon.xml` |
| Status and navigation bars | Capacitor SystemBars, `insetsHandling: native`: the WebView sits between the bars, the window behind them is paper (dark: night paper). | `capacitor.config.ts`, `res/values*/colors.xml` |
| Light / dark | A sun/moon button in the top bar and an **Appearance** card in Settings (System, Light, Dark). The choice is saved in localStorage and mirrored to native storage. `src/theme.ts` applies it as `data-theme` on `<html>` (the CSS `theme-dark` variant reads it), and `MainActivity.EaseNative` gives the page the system theme at start (`isDark`) and lets it set the status/navigation bar icons and window colour (`setBars`). System switches while the app is open reach the page as an `ease-system-theme` event, which it ignores if you picked Light or Dark. The switch is one view transition (a circle growing from the tapped control) with all CSS transitions off while it runs, so every colour changes in the same frame; the status/navigation bars follow when it ends. The activity is not restarted, so a running timer survives. | `src/theme.ts`, `MainActivity.java`, `src/index.css` |
| Icon | Adaptive vector icon (ring + dot on paper) with a monochrome layer for themed icons; PNGs for API 24-25. | `res/drawable/ic_launcher_*.xml`, `res/mipmap-*` |
| Saved settings | Three small settings (`ease.pregnancyStatus`, `ease.theme`, `ease.pregnancyNudge`) are kept in localStorage and mirrored to native SharedPreferences (`@capacitor/preferences`), which is the source of truth at startup: the WebView writes its storage to disk about a second late, so a fast kill could otherwise lose them. | `src/native.ts`, `usePregnancyStatus.ts`, `theme.ts`, `PregnancyPrompt.tsx` |
| Privacy | No `INTERNET` / network-state permission (removed even if a library adds it). Cloud backup and device transfer are off, so the settings (including the pregnancy answer) never leave the phone. | `AndroidManifest.xml`, `res/xml/data_extraction_rules.xml` |

Debug builds can be inspected from `chrome://inspect`; release builds cannot.

The website build is unchanged by all this (every native call is a no-op in a browser, and the website keeps
its service worker). The plugins' small web shims do ship in the website bundle.

## Update prompts (Google Play in-app updates)

When a newer build is on Google Play, Ease shows a small "A new version of Ease is available" card with **Update** and
**Later** (`src/update.ts`, `@capawesome/capacitor-app-update`). Update starts a *flexible* Play update: it downloads in the
background and then asks to **Restart**. Google Play does the checking and downloading, so the app still has no INTERNET
permission (the plugin only adds Play's own update dialog activity; check with `aapt2 dump permissions`).

- Only installs from Google Play get it. A sideloaded APK or an emulator build shows nothing (Play answers "install not
  allowed", which the app catches).
- **How to test for real:** upload build N and build N+1 to an Internal testing track, install N from the Play link, publish N+1,
  open the app (Play can take minutes to learn about the new build); the card appears. Or use Play's *Internal app sharing*.
- **Tuning:** `MIN_STALENESS_DAYS` in `src/update.ts` (0 = prompt as soon as Play reports an update); to force a critical
  update, set the in-app update priority for that release with the Play Developer API and call `performImmediateUpdate` for it.
- "Later" is remembered for the session only, so nothing extra is stored (and the privacy policy needs no new setting).

## Release to Google Play

Everything you upload is prepared in this repo and `~/ease-signing/` (outside the repo, owner-only).

**What exists**
- `~/ease-signing/ease-upload.jks` + `keystore.properties`: the **upload key** (keep a backup in a password manager;
  never commit it). Play App Signing holds the real app-signing key, so a lost upload key can be reset in Play Console.
- `android/app/build.gradle` signs release builds with that key when `keystore.properties` exists (path override:
  `$EASE_KEYSTORE_PROPERTIES`); without it the release build is unsigned, so a fresh clone still builds.
- `store/`: icon, feature graphic, 8 phone screenshots and the listing text (`store/listing.md`).

**Build a release**
1. Version: one place, `package.json`. `version` is the version name and `config.androidVersionCode` the build number
   (Gradle reads both). **Raise `androidVersionCode` by 1 for every upload** (build 1 is the first).
2. `npm run android:sync`, then `cd android && ./gradlew bundleRelease assembleRelease`.
   - Upload this: `android/app/build/outputs/bundle/release/app-release.aab` (copy it to `~/ease-signing/release/`).
   - `app-release.apk` (same folder pattern, `apk/release/`) is a signed APK for installing on a test phone.
3. Check: `jarsigner -verify app-release.aab` says "jar verified"; the certificate is `CN=FluxoGen Ease upload key`.

**Upload (Play Console)**
1. **Account type.** A *personal* account created after 13 Nov 2023 must first run a **closed test with at least 12
   testers opted in for 14 continuous days**, then apply for production access (Play Console, Dashboard). An
   *organization* account does not have this requirement. Rules change: check the live Play Console page.
2. **Create app:** name "Ease: Self-Acupressure Guide", English, App, Free.
3. **App content (policy):**
   - **Privacy policy:** https://fluxogen.github.io/legal/ease/privacy/
   - **App access:** all features work with no login. **Ads:** no.
   - **Content rating:** answer the questionnaire honestly (reference/health education, no user content, no violence).
   - **Target audience:** 18+ (matches the privacy policy). **Advertising ID:** not used. **Government / financial / news:** no.
   - **Data safety:** no data collected, no data shared (three small settings stay on the device and are never sent).
   - **Health apps declaration:** required for every app. Select the health categories that honestly fit (for example
     stress or sleep management) and say it is wellness education, not a medical device.
4. **Main store listing:** copy from `store/listing.md`; upload `store/icon-512.png`, `store/feature-graphic-1024x500.png` and
   `store/screenshots/*.png` (phone screenshots: each side 320-3840 px, long side at most 2x the short side; 1080x1920 is used).
   Optional large-screen sets, real captures of the tablet layout: `store/screenshots-tablet` (2560x1440, for both the 7-inch
   and 10-inch slots) and `store/screenshots-desktop` (1920x1080, Chromebook/desktop); the console wants 4 to 8 per
   section, 16:9 or 9:16, 1080-7680 px. Leave Android XR empty (not built or tested for XR).
   Category Health & Fitness; contact fluxogentechnologies@gmail.com; website https://ease-murex.vercel.app.
5. **Testing > Internal testing:** create a release, upload the `.aab`, add yourself as a tester, then install from the
   Play link on a **real phone** and run the checklist below.
6. **Closed test** (needed for personal accounts): add 12+ testers, keep them opted in for 14 days, then apply for production.
7. **Production:** create the release from the same bundle, roll out. The first review can take several days.
8. **Updates:** raise `androidVersionCode`, build, upload the new `.aab` (same upload key). People on the previous build then
   see the update card described above.

Target API is 36, which meets Play's rule for new apps and updates (Android 16 / API 36 from 31 Aug 2026). The app does not
lock orientation, so it also meets the large-screen rule.

**Regenerate the store assets** after any UI change: `qa/android/store.sh` (emulator; screenshots are real 1080x1920 captures).

## Device checklist (before each release)

- Fresh install opens straight to Home (no blocking question); the optional pregnancy card works; the answer survives a restart.
- Home > routine > point > Start press; back closes the press, then returns routine > Home > leaves the app.
- Screen stays on during a press; pause releases it.
- Privacy / terms / source links open in the browser; Send feedback (Settings or About) opens the mail app; returning lands on the same page.
- Settings shows "Version X (build N)" matching `package.json`; the Content id matches the latest commit.
- Airplane mode: cold start, every tab, photos and drawings load.
- Dark mode (the sun/moon button and the Appearance choices, including while the system theme differs), landscape, largest font size, 3-button navigation: nothing cut off, no sideways scroll.

The same checks are automated in [`qa/`](../qa/README.md): `qa/android/install.sh`, then `npm run qa:android`
(device suite, theme, and a six-screen-size adaptivity tour).
