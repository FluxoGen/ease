// "A new version is available" for both builds, with no backend of our own.
//   Android app: Google Play's in-app update API (a flexible update: it downloads in the background). Play does the
//                checking and downloading, so the app still needs no INTERNET permission. Only for installs from Play.
//   Website:     the service worker. A new deploy is detected by the browser; the user chooses when to reload.
// Dismissing ("Later") lasts for the current session only, so nothing new is stored on the device.
import { App as CapApp } from '@capacitor/app';
import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';
import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { isApp, isNative } from './native';

export type UpdatePhase = 'none' | 'available' | 'downloading' | 'ready';
export interface UpdateState {
  phase: UpdatePhase;
  /** Which update this is: Google Play (the app) or a new deploy (the website). */
  source: 'play' | 'web';
  /** 0..1 while downloading, when Play reports it. */
  progress: number | null;
  /** The last try failed; the prompt offers to try again. */
  failed: boolean;
}

/** Only nag once Play has known about the update this many days. 0 = as soon as Play reports it. Raise to be gentler. */
const MIN_STALENESS_DAYS = 0;
/** Wait this long after launch before the first Play check, so the first screen is never held up. */
const FIRST_CHECK_DELAY_MS = 4000;
/** Re-check no more than once per hour (app resume / tab focus). */
const RECHECK_MS = 60 * 60 * 1000;

let state: UpdateState = { phase: 'none', source: isNative ? 'play' : 'web', progress: null, failed: false };
let dismissed = false;
let demo = false;
const listeners = new Set<() => void>();
const set = (patch: Partial<UpdateState>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };

export function useUpdate(): UpdateState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => state,
    () => state,
  );
}

let updateSW: ((reload?: boolean) => Promise<void>) | null = null;
let lastCheck = 0;

async function checkPlay() {
  if (Date.now() - lastCheck < RECHECK_MS && state.phase !== 'none') return;
  lastCheck = Date.now();
  try {
    const info = await AppUpdate.getAppUpdateInfo();
    if (info.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS && info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
      set({ phase: 'ready', failed: false });
    } else if (info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE && !dismissed
      && (info.clientVersionStalenessDays ?? 0) >= MIN_STALENESS_DAYS) {
      set({ phase: 'available', failed: false });
    }
  } catch {
    // Not installed from Google Play (sideload, emulator) or Play unavailable: no prompt, nothing to report.
  }
}

/** Call once at startup. */
export function initUpdates() {
  // Dev-only preview of the prompt in a browser: ?update=available | downloading | ready (add &app=1 for the app layout).
  if (import.meta.env.DEV) {
    const q = new URLSearchParams(window.location.search).get('update');
    if (q === 'available' || q === 'downloading' || q === 'ready') {
      demo = true;
      // The app layout previews the Play flow (Update / Restart); the website layout previews Reload.
      set({ phase: q, source: isApp ? 'play' : 'web', progress: q === 'downloading' ? 0.4 : null });
      return;
    }
  }
  if (isNative) {
    // Not at startup: asking Play on the first frame measurably slowed the first screen. Wait until the app has been open a
    // few seconds, then listen and check. (Resume checks are cheap to register now.)
    CapApp.addListener('resume', () => { checkPlay(); }).catch(() => {});
    window.setTimeout(() => {
      AppUpdate.addListener('onFlexibleUpdateStateChange', (s) => {
        if (s.installStatus === FlexibleUpdateInstallStatus.DOWNLOADING && s.bytesDownloaded !== undefined && s.totalBytesToDownload) {
          set({ phase: 'downloading', progress: s.bytesDownloaded / s.totalBytesToDownload });
        } else if (s.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
          set({ phase: 'ready', progress: null });
        } else if (s.installStatus === FlexibleUpdateInstallStatus.FAILED || s.installStatus === FlexibleUpdateInstallStatus.CANCELED) {
          set({ phase: 'available', progress: null, failed: true });
        }
      }).catch(() => {});
      checkPlay();
    }, FIRST_CHECK_DELAY_MS);
    return;
  }
  if (import.meta.env.PROD) {
    // The service worker only exists in a production website build.
    updateSW = registerSW({
      onNeedRefresh() { if (!dismissed) set({ phase: 'available', failed: false }); },
      onRegisteredSW(_url, reg) {
        if (!reg) return;
        // Look for a new deploy now and then, and when the tab comes back, not just on reload.
        const check = () => { if (Date.now() - lastCheck > 60_000) { lastCheck = Date.now(); reg.update().catch(() => {}); } };
        setInterval(check, RECHECK_MS);
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      },
    });
  }
}

/** The "Update" / "Reload" / "Restart" button. */
export async function applyUpdate() {
  if (demo) {
    if (state.source === 'web') {
      // The website has no download step: Reload swaps in the waiting version and the page restarts.
      set({ phase: 'none', progress: null });
    } else if (state.phase === 'available') {
      set({ phase: 'downloading', progress: 0.1, failed: false });
      let p = 0.1;
      const t = setInterval(() => { p += 0.2; if (p >= 1) { clearInterval(t); set({ phase: 'ready', progress: null }); } else set({ progress: p }); }, 600);
    } else if (state.phase === 'ready') {
      // Stands in for the app restarting on the new version: the prompt goes away.
      set({ phase: 'none', progress: null });
    }
    return;
  }
  if (!isNative) { await updateSW?.(true); return; }
  try {
    if (state.phase === 'ready') { await AppUpdate.completeFlexibleUpdate(); return; }
    const info = await AppUpdate.getAppUpdateInfo();
    set({ phase: 'downloading', progress: null, failed: false });
    if (info.flexibleUpdateAllowed) await AppUpdate.startFlexibleUpdate();
    else if (info.immediateUpdateAllowed) await AppUpdate.performImmediateUpdate();
    else { await AppUpdate.openAppStore(); set({ phase: 'available' }); }
  } catch {
    set({ phase: 'available', progress: null, failed: true });
  }
}

/** "Later": hide the prompt until the app or page is opened again. */
export function dismissUpdate() {
  dismissed = true;
  set({ phase: 'none', failed: false });
}
