// Light / dark / follow-the-system. The choice is saved (and mirrored to native storage in the Android app).
// CSS reads <html data-theme="light|dark"> (see the theme-dark variant in index.css); with "system" on the
// website the attribute is left off and the browser's own setting decides.
import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { isNative, persistNative } from './native';

export type ThemePref = 'system' | 'light' | 'dark';

const KEY = 'ease.theme';
const COLORS = { light: '#f6f3ec', dark: '#191715' };

interface NativeBridge { isDark?: () => boolean; setBars?: (dark: boolean) => void }
const bridge = (): NativeBridge | undefined => (window as unknown as { EaseNative?: NativeBridge }).EaseNative;

let pref: ThemePref = 'system';
let systemDark = false;
let snapshot: { pref: ThemePref; dark: boolean } = { pref, dark: false };
const listeners = new Set<() => void>();

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function readSystemDark(): boolean {
  try {
    if (isNative && bridge()?.isDark) return bridge()!.isDark!();
  } catch { /* fall through */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const effectiveDark = () => (pref === 'system' ? systemDark : pref === 'dark');

/** Tell the Android app which theme is showing (status/navigation bar icons and window colour). */
function syncBars() {
  try { bridge()?.setBars?.(effectiveDark()); } catch { /* not in the app */ }
}

function apply(updateBars = true) {
  const root = document.documentElement;
  const dark = effectiveDark();
  // The Android WebView only reads the system theme at start, so the app always states it explicitly.
  if (pref === 'system' && !isNative) delete root.dataset.theme;
  else root.dataset.theme = dark ? 'dark' : 'light';

  // Browser / system chrome colour. With a chosen theme override both media-specific tags.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.dataset.orig ??= `${meta.content}|${meta.media}`;
    const [content, media] = meta.dataset.orig.split('|');
    if (pref === 'system') { meta.content = content; meta.media = media; } else { meta.content = COLORS[dark ? 'dark' : 'light']; meta.media = 'all'; }
  }
  if (updateBars) syncBars();

  snapshot = { pref, dark };
  listeners.forEach((l) => l());
}

/** Call once before the first render (after native storage is restored). */
export function initTheme() {
  pref = readPref();
  systemDark = readSystemDark();
  apply();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!isNative) { systemDark = e.matches; withoutTransitions(apply); }
  });
  // The Android activity reports system theme switches (MainActivity.onConfigurationChanged).
  window.addEventListener('ease-system-theme', (e) => {
    systemDark = (e as CustomEvent<string>).detail === 'dark';
    withoutTransitions(apply);
  });
}

/**
 * Run a theme change with every CSS transition switched off, so all colours change in the same frame. Without
 * this, anything with a `transition` class fades over 150 ms while the rest snaps (hundreds of independent
 * fades on one screen), which looks like the theme changing in layers.
 */
function withoutTransitions(change: () => void, release = true) {
  const root = document.documentElement;
  root.dataset.themeSwitching = '';
  change();
  void root.offsetHeight; // flush styles while transitions are off
  if (release) requestAnimationFrame(() => requestAnimationFrame(() => { delete root.dataset.themeSwitching; }));
}

type Origin = { x: number; y: number };

/** `origin` (the tapped control's centre) is where the circular reveal grows from. */
export function setThemePref(next: ThemePref, origin?: Origin) {
  const commit = (bars = true) => {
    pref = next;
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
    persistNative(KEY, next);
    apply(bars);
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wasDark = effectiveDark();
  const willChange = (next === 'system' ? systemDark : next === 'dark') !== wasDark;
  const root = document.documentElement;
  if (!document.startViewTransition || reduced || !willChange) {
    withoutTransitions(() => flushSync(commit));
    return;
  }
  // One snapshot of the old screen, one of the new, revealed with a single expanding circle: everything changes
  // together and the browser does the work on the GPU.
  root.dataset.themeSwitching = '';
  const x = origin?.x ?? window.innerWidth - 32;
  const y = origin?.y ?? 32;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  // The system bars follow once the reveal has finished, so they don't flip 400 ms before the page does.
  const vt = document.startViewTransition(() => { flushSync(() => commit(false)); });
  vt.ready
    .then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    ))
    .catch(() => {});
  vt.finished.catch(() => {}).finally(() => { delete root.dataset.themeSwitching; syncBars(); });
}

export function useTheme() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => snapshot,
    () => snapshot,
  );
}
