// QA android/theme: Light/Dark/System on the device: choice survives killing the app, explicit choice ignores system changes,
// system choice follows them, and the status bar / gesture strip colours + icon colours match the chosen theme.
// Needs: a booted emulator/device with the debug APK installed.
import { _android as android } from 'playwright';
import { execSync } from 'child_process';
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { ADB } from '../lib/android.mjs';
import { outPath } from '../lib/env.mjs';
const sh = (c) => execSync(`${ADB} shell ${JSON.stringify(c)}`, { encoding: 'utf8', maxBuffer: 64 << 20 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = []; const ok = (n, c, d = '') => { const l = `${c ? 'PASS' : 'FAIL'}  ${n} ${d}`; out.push(l); console.log(l); };
const SHOTS = outPath('android-theme-shots');
fs.mkdirSync(SHOTS, { recursive: true });
const [dev] = await android.devices();
let p;
const attach = async () => { for (let i = 0; i < 40; i++) { const pid = sh('pidof com.fluxogen.ease').trim(); if (pid && sh('cat /proc/net/unix').includes('webview_devtools_remote_' + pid)) { try { p = await (await dev.webView({ socketName: 'webview_devtools_remote_' + pid })).page(); await p.waitForSelector('#root > *'); return; } catch {} } await sleep(400); } throw new Error('attach'); };
const launch = async (clear) => { sh('am force-stop com.fluxogen.ease'); if (clear) sh('pm clear com.fluxogen.ease'); sh('am start -W -n com.fluxogen.ease/.MainActivity'); await sleep(1500); await attach(); };
// Status bar / gesture strip background colours and a measure of the status-bar icon brightness, read from a screenshot.
const pix1 = (name) => {
  const file = `${SHOTS}/${name}.png`;
  fs.writeFileSync(file, execSync(`${ADB} exec-out screencap -p`, { maxBuffer: 64 << 20 }));
  const png = PNG.sync.read(fs.readFileSync(file));
  const at = (x, y) => { const k = (y * png.width + x) * 4; return [png.data[k], png.data[k + 1], png.data[k + 2]]; };
  const hex = (c) => c.map((v) => v.toString(16).padStart(2, '0')).join('');
  let sum = 0, n = 0;
  for (let x = 60; x < 200; x++) for (let y = 25; y < 75; y++) { sum += Math.min(...at(x, y)); n++; }
  return [`${hex(at(8, 40))} ${hex(at(8, png.height - 6))}`, String(Math.round(sum / n))];
};
// The native bars repaint a moment after the page changes; poll for the expected colour instead of a fixed wait.
const pix = async (name, want) => { let r; for (let i = 0; i < 10; i++) { r = pix1(name); if (!want || r[0].startsWith(want)) break; await sleep(500); } return r; };
const bgOf = () => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
const LIGHT = 'rgb(246, 243, 236)', DARK = 'rgb(25, 23, 21)';
const go = async (u) => { await p.evaluate((x) => { history.pushState({}, '', x); dispatchEvent(new PopStateEvent('popstate')); }, u); await sleep(600); };

sh('cmd uimode night no'); await sleep(1500);
await launch(true);
ok('system light: app light', (await bgOf()) === LIGHT);
await p.getByRole('button', { name: 'Switch to dark mode' }).click(); await sleep(700);
ok('toggle -> dark (system is light)', (await bgOf()) === DARK);
let [bars, ico] = await pix('dark-on-light-system', '191715');
ok('status bar + gesture strip painted dark', bars === '191715 191715', bars);
ok('status bar icons are light (readable on dark)', Number(ico) > 24 + 6, `avg ${ico}`);
await launch(false);
ok('choice survives killing the app', (await bgOf()) === DARK);
[bars] = await pix('dark-after-restart', '191715'); ok('bars still dark after restart', bars.startsWith('191715'), bars);
sh('cmd uimode night yes'); await sleep(2500);
ok('explicit Dark stays when system goes dark', (await bgOf()) === DARK);
await go('/settings'); await p.getByRole('radio', { name: 'Light' }).click(); await sleep(700);
ok('Appearance: Light while system is dark', (await bgOf()) === LIGHT);
[bars, ico] = await pix('light-on-dark-system', 'f6f3ec'); ok('bars painted light', bars === 'f6f3ec f6f3ec', bars); ok('status icons dark (readable on light)', Number(ico) < 246 - 8, `avg ${ico}`);
sh('cmd uimode night no'); await sleep(2500);
ok('explicit Light ignores system change', (await bgOf()) === LIGHT);
await p.getByRole('radio', { name: 'System' }).click(); await sleep(700);
ok('System option: light (system is light)', (await bgOf()) === LIGHT);
sh('cmd uimode night yes'); await sleep(2500);
ok('System option follows live switch to dark', (await bgOf()) === DARK);
[bars] = await pix('system-dark', '191715'); ok('bars dark with system dark', bars === '191715 191715', bars);
await launch(false);
ok('System preference survives restart (dark system -> dark)', (await bgOf()) === DARK);
sh('cmd uimode night no'); await sleep(2000);
console.log(`${out.filter((l) => l.startsWith('PASS')).length} pass, ${out.filter((l) => l.startsWith('FAIL')).length} fail`);
await dev.close();
