// Android app shell glue (Capacitor). Everything here is a no-op in the browser, so the web build and
// the app share one code path. See docs/android.md.
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const isNative = Capacitor.isNativePlatform();

/**
 * App layout (Material-style app bar, navigation bar, sheets) instead of the website layout. Always on in the
 * Android app. In `npm run dev` it can be previewed in a browser with ?app=1 (kept for the tab's session).
 * It is never on in a production website build.
 */
export const isApp = isNative || (import.meta.env.DEV && (() => {
  try {
    if (new URLSearchParams(window.location.search).get('app') === '1') sessionStorage.setItem('ease.app', '1');
    return sessionStorage.getItem('ease.app') === '1';
  } catch { return false; }
})());
// Set before the first render so CSS can switch layouts without a flash.
if (isApp) document.documentElement.dataset.app = '';

/** Settings mirrored to native storage. WebView localStorage is written to disk lazily (about a second
 * later), so an answer given just before the app is killed could be lost; SharedPreferences is not. */
const PERSISTED_KEYS = ['ease.pregnancyStatus', 'ease.theme', 'ease.pregnancyNudge'];

/**
 * Before the first render. Native storage is the source of truth: it is written at once, while the
 * WebView may not have saved its own copy yet. A value only in localStorage (older installs) is copied over.
 */
export async function restoreNativeState(): Promise<void> {
  if (!isNative) return;
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
  if (!isApp) return () => {};
  const stopRipple = initRipple();
  if (!isNative) return stopRipple;
  document.documentElement.dataset.native = 'android';
  document.addEventListener('click', onDocumentClick, true);

  // `canGoBack` is the WebView's own history, which stays right after redirects that replace an entry.
  const sub = CapApp.addListener('backButton', ({ canGoBack }) => {
    // A bottom sheet that is not a dialog (body-map result) offers its own close button.
    const closer = document.querySelector<HTMLElement>('[data-back-closes]');
    if (closer && !document.querySelector('[role="dialog"]')) { closer.click(); return; }
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
      // Headless UI dialogs close on Escape.
      (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      return;
    }
    if (canGoBack) back.goBack();
    else if (!back.goHome()) CapApp.minimizeApp().catch(() => {});
  });

  hideSplash();

  return () => {
    stopRipple();
    document.removeEventListener('click', onDocumentClick, true);
    sub.then((s) => s.remove()).catch(() => {});
  };
}

const PRESSABLE = 'a[href], button:not([disabled]), [role="button"], summary';

/**
 * Material-style touch ripple for anything pressable. It lives in a small overlay on <body> that copies the
 * pressed element's box, radius and text colour, so no component needs wrapping or `overflow: hidden`.
 * It is removed as soon as the finger starts scrolling, so a swipe never flashes.
 */
function initRipple(): () => void {
  let cleanup: (() => void) | null = null;

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = (e.target as Element | null)?.closest?.(PRESSABLE) as HTMLElement | null;
    if (!el || el.closest('[data-no-ripple]') || el.getAttribute('aria-disabled') === 'true') return;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) return;
    cleanup?.();

    const cs = getComputedStyle(el);
    const box = document.createElement('div');
    box.className = 'app-ripple';
    box.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:${cs.borderRadius};color:${cs.color}`;
    const size = Math.hypot(r.width, r.height) * 2;
    const dot = document.createElement('i');
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    box.appendChild(dot);
    document.body.appendChild(box);

    const x0 = e.clientX, y0 = e.clientY;
    const stop = (fade: boolean) => {
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('scroll', onCancel, true);
      if (cleanup === remove) cleanup = null;
      if (fade) { box.classList.add('out'); window.setTimeout(() => box.remove(), 320); } else box.remove();
    };
    const onUp = () => stop(true);
    const onCancel = () => stop(false);
    const onMove = (m: PointerEvent) => { if (Math.hypot(m.clientX - x0, m.clientY - y0) > 10) stop(false); };
    const remove = () => stop(false);
    cleanup = remove;
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('scroll', onCancel, true);
  };

  document.addEventListener('pointerdown', onDown, true);
  return () => { document.removeEventListener('pointerdown', onDown, true); cleanup?.(); };
}
