// QA android/tour: adaptivity tour of the installed app on the current screen: for each font scale x orientation it visits
// key screens and the guided press, checks layout (overflow, off-screen text, tap targets, nav bar, content hidden behind
// bars, press Start on screen) and saves screenshots. Usage: node tour.mjs <label>   (SCALES=1.0,2.0 to choose font scales;
// $ANDROID_SERIAL picks the device). sizes.sh runs it across screen sizes.
// For each font scale x orientation: opens the installed app, visits key screens, checks layout, takes screenshots.
import { _android as android } from 'playwright';
import { execSync } from 'child_process';
import fs from 'node:fs';
import { ADB, SERIAL } from '../lib/android.mjs';
import { outPath } from '../lib/env.mjs';

const LABEL = process.argv[2] || 'device';
const sh = (c) => execSync(`${ADB} shell ${JSON.stringify(c)}`, { encoding: 'utf8', maxBuffer: 64 << 20 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = outPath('tour', LABEL);
fs.mkdirSync(OUT, { recursive: true });

const devs = await android.devices();
const dev = SERIAL ? devs.find((d) => d.serial() === SERIAL) : devs[0];
if (!dev) throw new Error('no device');

const issues = [];
const info = { label: LABEL, size: sh('wm size').trim().split(': ').pop(), density: sh('wm density').trim().split(': ').pop(), android: sh('getprop ro.build.version.release').trim(), api: sh('getprop ro.build.version.sdk').trim() };
const wv = sh('dumpsys webviewupdate').match(/Current WebView package \(name, version\): \(([^)]*)\)/);
info.webview = wv ? wv[1] : '?';

const SCREENS = ['/', '/map', '/points', '/settings', '/safety', '/about', '/routine/headache', '/point/lu7', '/point/cv13', '/point/ex-ue11', '/point/st9'];
const SHOT = new Set(['/', '/map', '/point/lu7', '/settings']);

async function attach() {
  for (let i = 0; i < 50; i++) {
    const pid = sh('pidof com.fluxogen.ease').trim();
    if (pid && sh('cat /proc/net/unix').includes('webview_devtools_remote_' + pid)) {
      try {
        const page = await (await dev.webView({ socketName: 'webview_devtools_remote_' + pid })).page();
        await page.waitForSelector('#root > *', { timeout: 8000 });
        return page;
      } catch { /* retry */ }
    }
    await sleep(400);
  }
  throw new Error('attach failed');
}

const check = (p) => p.evaluate(() => {
  const out = { overflow: document.documentElement.scrollWidth - innerWidth, off: [], small: [], hidden: 0, h1: document.querySelectorAll('h1').length, nav: null, vw: innerWidth, vh: innerHeight };
  const vis = (e) => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !e.closest('[aria-hidden=true]'); };
  for (const e of document.querySelectorAll('h1,h2,h3,p,span,a,button,li,img')) {
    if (!vis(e) || e.closest('.no-scrollbar') || e.closest('svg')) continue;
    const r = e.getBoundingClientRect();
    if (r.right > innerWidth + 1 || r.left < -1) out.off.push((e.textContent || e.alt || e.tagName).trim().slice(0, 30));
  }
  for (const e of document.querySelectorAll('a[href],button,[role=radio],[role=button],input,select')) {
    if (!vis(e) || e.closest('svg') || e.closest('.sr-only')) continue;
    const r = e.getBoundingClientRect(); const dp = 1; // CSS px == dp
    if (r.width < 40 * dp || r.height < 40 * dp) out.small.push(((e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 24)) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  const nav = document.querySelector('nav[aria-label=Main]');
  if (nav) { const r = nav.getBoundingClientRect(); out.nav = { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inView: r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 }; }
  window.scrollTo(0, document.documentElement.scrollHeight);
  const bars = [...document.querySelectorAll('nav[aria-label=Main], .pressbar')].filter((e) => getComputedStyle(e).position === 'fixed' && vis(e));
  const main = document.querySelector('main');
  const leaves = [...main.querySelectorAll('*')].filter((e) => e.children.length === 0 && !e.closest('svg') && !e.closest('.pressbar') && vis(e));
  const last = leaves.length ? Math.max(...leaves.map((e) => e.getBoundingClientRect().bottom)) : 0;
  const tops = bars.map((e) => e.getBoundingClientRect()).filter((r) => r.width > innerWidth * 0.5 && r.top > innerHeight * 0.4).map((r) => r.top);
  out.hidden = tops.length && last > Math.min(...tops) + 2 ? Math.round(last - Math.min(...tops)) : 0;
  window.scrollTo(0, 0);
  return out;
});

const combos = [];
for (const scale of (process.env.SCALES || '1.0,1.3,2.0').split(',')) for (const rot of [0, 1]) combos.push({ scale, rot });

for (const { scale, rot } of combos) {
  const tag = `${LABEL} font${scale} ${rot ? 'landscape' : 'portrait'}`;
  sh('settings put system accelerometer_rotation 0'); sh(`settings put system user_rotation ${rot}`);
  sh(`settings put system font_scale ${scale}`); await sleep(1800);
  sh('am force-stop com.fluxogen.ease'); sh('am start -W -n com.fluxogen.ease/.MainActivity'); await sleep(1500);
  const p = await attach();
  await p.evaluate(() => localStorage.setItem('ease.pregnancyStatus', 'no'));
  const go = async (u) => { await p.evaluate((x) => { history.pushState({}, '', x); dispatchEvent(new PopStateEvent('popstate')); }, u); await sleep(1100); };
  await go('/');
  const dims = await p.evaluate(() => `${innerWidth}x${innerHeight}`);
  for (const u of SCREENS) {
    await go(u);
    const r = await check(p);
    const n = (m) => issues.push(`${tag} (${dims}) ${u}: ${m}`);
    if (r.overflow > 1) n(`horizontal overflow ${r.overflow}px`);
    if (r.off.length) n(`off-screen: ${[...new Set(r.off)].slice(0, 3).join(' | ')}`);
    if (r.h1 < 1) n('no h1');
    if (r.hidden > 0) n(`last content hidden behind a bar by ${r.hidden}px`);
    if (r.nav && !r.nav.inView) n(`navigation bar not fully on screen ${JSON.stringify(r.nav)}`);
    // small targets matter at normal size; at 2.0 only report the app's own primary controls
    if (r.small.length) n(`small tap targets: ${[...new Set(r.small)].slice(0, 4).join(' | ')}`);
    if (SHOT.has(u)) execSync(`${ADB} exec-out screencap -p > "${OUT}/${scale}-${rot ? 'land' : 'port'}-${u.replace(/\W+/g, '_') || 'home'}.png"`, { maxBuffer: 64 << 20 });
  }
  // press sheet + sheets
  await go('/point/pc6'); await p.getByRole('button', { name: /Start press/ }).last().click(); await sleep(800);
  const press = await p.evaluate(() => { const d = document.querySelector('[role=dialog]'); if (!d) return { ok: false }; const btn = [...d.querySelectorAll('button')].find((b) => /^Start$/.test(b.textContent.trim())); const r = btn?.getBoundingClientRect(); return { ok: true, startVisible: !!r && r.bottom <= innerHeight && r.top >= 0, of: document.documentElement.scrollWidth - innerWidth, dialogScrolls: d.scrollHeight > d.clientHeight + 2 || document.querySelector('[role=dialog] > div')?.scrollHeight > innerHeight + 2 }; });
  if (!press.ok) issues.push(`${tag}: press sheet did not open`);
  else if (!press.startVisible) issues.push(`${tag}: press sheet Start button not on screen (needs scrolling)`);
  execSync(`${ADB} exec-out screencap -p > "${OUT}/${scale}-${rot ? 'land' : 'port'}-press.png"`, { maxBuffer: 64 << 20 });
  await p.keyboard.press('Escape'); await sleep(400);
}
sh('settings put system font_scale 1.0'); sh('settings put system user_rotation 0'); sh('settings put system accelerometer_rotation 1');
fs.writeFileSync(outPath('tour', LABEL, 'report.json'), JSON.stringify({ info, issues }, null, 2));
console.log(JSON.stringify(info));
console.log(issues.length ? issues.join('\n') : 'no issues');
console.log('total', issues.length);
await dev.close();
