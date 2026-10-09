// Light / dark / follow-the-system. The choice is saved (and mirrored to native storage in the Android app).
// CSS reads <html data-theme="light|dark"> (see the theme-dark variant in index.css); with "system" on the
// website the attribute is left off and the browser's own setting decides.
import { useSyncExternalStore } from 'react';
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

function apply() {
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
  try { bridge()?.setBars?.(dark); } catch { /* not in the app */ }

  snapshot = { pref, dark };
  listeners.forEach((l) => l());
}

/** Call once before the first render (after native storage is restored). */
export function initTheme() {
  pref = readPref();
  systemDark = readSystemDark();
  apply();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!isNative) { systemDark = e.matches; apply(); }
  });
  // The Android activity reports system theme switches (MainActivity.onConfigurationChanged).
  window.addEventListener('ease-system-theme', (e) => {
    systemDark = (e as CustomEvent<string>).detail === 'dark';
    apply();
  });
}

export function setThemePref(next: ThemePref) {
  pref = next;
  try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  persistNative(KEY, next);
  apply();
}

export function useTheme() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => snapshot,
    () => snapshot,
  );
}
