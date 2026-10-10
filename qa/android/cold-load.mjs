// QA android/cold-load: the app must always draw its first screen. Loads an unknown path 25 times (a cold page load that
// redirects to Home) and fails if any load leaves a blank screen or takes too long. Catches a startup that waits on a native
// call that never answers (the cause of a rare blank screen on a loaded device).
import { _android as android } from 'playwright';
import { execSync } from 'node:child_process';
import { ADB, PKG } from '../lib/android.mjs';

const sh = (c) => execSync(`${ADB} shell ${JSON.stringify(c)}`, { encoding: 'utf8' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RUNS = 25, LIMIT_MS = 8000;
const [dev] = await android.devices();
sh(`am force-stop ${PKG}`); sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(2000);
const pid = sh(`pidof ${PKG}`).trim();
const p = await (await dev.webView({ socketName: 'webview_devtools_remote_' + pid })).page(); await p.waitForSelector('#root > *');
const times = []; const blank = [];
for (let i = 0; i < RUNS; i++) {
  const t = Date.now(); await p.goto('https://localhost/does-not-exist');
  let landed = ''; for (let n = 0; n < LIMIT_MS / 100 && landed !== '/'; n++) { await sleep(100); landed = await p.evaluate(() => location.pathname).catch(() => ''); }
  times.push(Date.now() - t);
  if (landed !== '/') blank.push(`run ${i + 1}: ${JSON.stringify(await p.evaluate(() => ({ root: document.getElementById('root')?.children.length, path: location.pathname })).catch(() => 'unreadable'))}`);
}
times.sort((a, b) => a - b);
const ok = blank.length === 0;
console.log(`${ok ? 'PASS' : 'FAIL'}  ${RUNS} cold loads: ${RUNS - blank.length} drew the first screen (median ${times[Math.floor(RUNS / 2)]} ms, max ${times[RUNS - 1]} ms)`);
for (const b of blank) console.log(`FAIL  blank screen, ${b}`);
console.log(`${ok ? 1 : 0} pass, ${ok ? 0 : 1} fail`);
await dev.close();
