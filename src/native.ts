// Android app shell glue (Capacitor). Everything here is a no-op in the browser, so the web build and
// the app share one code path. See docs/android.md.
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const isNative = Capacitor.isNativePlatform();

/** Settings mirrored to native storage. WebView localStorage is written to disk lazily (about a second
 * later), so an answer given just before the app is killed could be lost; SharedPreferences is not. */
const PERSISTED_KEYS = ['ease.pregnancyStatus'];

/**
 * Before the first render. Native storage is the source of truth: it is written at once, while the
 * WebView may not have saved its own copy yet. A value only in localStorage (older installs) is copied over.
 */
export async function restoreNativeState(): Promise<void> {
  if (!isNative) return;
  // System light/dark from Android (MainActivity.EaseNative); later switches arrive the same way.
  try {
    const bridge = (window as unknown as { EaseNative?: { isDark: () => boolean } }).EaseNative;
    if (bridge) document.documentElement.dataset.theme = bridge.isDark() ? 'dark' : 'light';
  } catch {
    // fall back to the WebView's media query
  }
  await Promise.all(PERSISTED_KEYS.map(async (key) => {
    try {
      const { value } = await Preferences.get({ key });
      const local = localStorage.getItem(key);
      if (value !== null) {
        if (local !== value) localStorage.setItem(key, value);
      } else if (local !== null) {
        await Preferences.set({ key, value: local });
      }
    } catch {
      // storage unavailable: the app still works, it just asks again
    }
  }));
}

/** Mirror a persisted setting to native storage (no-op on the web). `null` removes it. */
export function persistNative(key: string, value: string | null) {
  if (!isNative) return;
  (value === null ? Preferences.remove({ key }) : Preferences.set({ key, value })).catch(() => {});
}

/** Attribute that marks a dialog the back button must not dismiss (the pregnancy question). */
export const BLOCKING_DIALOG = 'data-blocking-dialog';

/**
 * Keep the screen on while a guided press runs. Native: the KeepAwake plugin (Android WebView has no
 * Screen Wake Lock API). Web: navigator.wakeLock where the browser supports it. Returns a release function.
 */
export async function keepScreenOn(): Promise<() => void> {
  if (isNative) {
    // The native flag is on/off, not counted: only the latest request may switch it off, so a quick
    // pause/resume can't let an old release turn the screen off mid-press.
    const token = ++awakeToken;
    try {
      await KeepAwake.keepAwake();
    } catch {
      return () => {};
    }
    return () => { if (token === awakeToken) KeepAwake.allowSleep().catch(() => {}); };
  }
  const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
  if (!wl) return () => {};
  try {
    const lock = await wl.request('screen');
    return () => { lock.release().catch(() => {}); };
  } catch {
    return () => {};
  }
}
let awakeToken = 0;

/** The launch splash stays until the first screen has rendered, so there is no blank flash. Safe to call
 * more than once; main.tsx also calls it with a timeout so a render error can never leave it up. */
export function hideSplash() {
  if (!isNative) return;
  setTimeout(() => { SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {}); }, 0);
}

/** Links that leave the app open in the system browser (Custom Tab), never inside the app's WebView. */
function onDocumentClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0) return;
  const a = (e.target as Element | null)?.closest?.('a[href]');
  if (!(a instanceof HTMLAnchorElement)) return;
  let url: URL;
  try { url = new URL(a.href, window.location.href); } catch { return; }
  if ((url.protocol === 'http:' || url.protocol === 'https:') && url.host !== window.location.host) {
    e.preventDefault();
    Browser.open({ url: url.href }).catch(() => {});
  }
  // mailto:, tel: and similar fall through: Capacitor hands non-app URLs to Android as an intent.
}

export interface BackHandler {
  goBack: () => void;
  /** Called at the root of the app's history when not already on Home. */
  goHome: () => boolean;
}

/**
 * Hardware/gesture back, in order: close an open dialog (guided press), go back in the app's own
 * history, go to Home, and only then send the app to the background (Android's root behaviour).
 */
export function initNative(back: BackHandler): () => void {
  if (!isNative) return () => {};
  document.documentElement.dataset.native = 'android';
  document.addEventListener('click', onDocumentClick, true);

  // `canGoBack` is the WebView's own history, which stays right after redirects that replace an entry.
  const sub = CapApp.addListener('backButton', ({ canGoBack }) => {
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
      if (dialog.closest(`[${BLOCKING_DIALOG}]`) || dialog.hasAttribute(BLOCKING_DIALOG) || dialog.querySelector(`[${BLOCKING_DIALOG}]`)) {
        CapApp.minimizeApp().catch(() => {});
        return;
      }
      // Headless UI dialogs close on Escape.
      (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      return;
    }
    if (canGoBack) back.goBack();
    else if (!back.goHome()) CapApp.minimizeApp().catch(() => {});
  });

  hideSplash();

  return () => {
    document.removeEventListener('click', onDocumentClick, true);
    sub.then((s) => s.remove()).catch(() => {});
  };
}
