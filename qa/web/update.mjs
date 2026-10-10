// QA web/update: the website's "new version available" prompt, with a real service-worker update cycle and no backend.
// Builds the site twice (different build ids) into a temp folder, serves it, opens v1, deploys v2 under it, and checks:
// the prompt appears, v1 keeps running until the user taps Reload, Reload swaps to v2, and "Later" hides it for the session.
// Self-contained (own port, own build output). Takes about a minute.
import { chromium } from 'playwright';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from '../lib/env.mjs';

const PORT = 4174;
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'ease-update-'));
const build = (id) => execSync(`npx vite build --outDir "${OUT}" --emptyOutDir`, { cwd: ROOT, env: { ...process.env, VERCEL_GIT_COMMIT_SHA: id }, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = []; const ok = (n, c, d = '') => { const l = `${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`; out.push(l); console.log(l); };

build('aaaaaaa');
const server = spawn('npx', ['vite', 'preview', '--outDir', OUT, '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
let up = false; for (let i = 0; i < 40 && !up; i++) { await sleep(500); up = await fetch(`http://localhost:${PORT}/`).then((r) => r.ok).catch(() => false); }
if (!up) { console.log('FAIL  preview server did not start'); server.kill(); process.exit(1); }

const b = await chromium.launch();
try {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  await ctx.addInitScript(() => localStorage.setItem('ease.pregnancyStatus', 'no'));
  const p = await ctx.newPage();
  const version = async () => { await p.goto(`http://localhost:${PORT}/settings`); await p.waitForSelector('text=/Version \\d/'); return (await p.locator('main').textContent()).match(/build ([0-9a-z]+)/)?.[1]; };
  const promptShown = () => p.getByText('A new version of Ease is available').isVisible().catch(() => false);

  ok('v1 loads and shows its build id', (await version()) === 'aaaaaaa');
  await p.evaluate(async () => { await navigator.serviceWorker.ready; });
  await p.reload(); await sleep(800);
  ok('the service worker controls the page (offline-capable)', await p.evaluate(() => !!navigator.serviceWorker.controller));
  ok('no prompt when there is nothing new', !(await promptShown()));

  build('bbbbbbb'); // "deploy" v2 under the running site
  await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
  for (let i = 0; i < 20 && !(await promptShown()); i++) await sleep(500);
  ok('a new deploy shows the "new version available" prompt', await promptShown());
  ok('v1 keeps running until the user chooses (page not replaced)', (await p.locator('main').textContent()).includes('aaaaaaa'));
  ok('the prompt offers Reload and Later', await p.getByRole('button', { name: 'Reload' }).isVisible() && await p.getByRole('button', { name: 'Later' }).isVisible());

  await p.getByRole('button', { name: 'Later' }).click(); await sleep(300);
  ok('"Later" hides it', !(await promptShown()));
  await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); }); await sleep(1500);
  ok('...and it stays hidden for this session', !(await promptShown()));
  await p.reload(); await sleep(1500);
  for (let i = 0; i < 10 && !(await promptShown()); i++) await sleep(400);
  ok('after reopening the page the prompt is offered again', await promptShown());

  await p.getByRole('button', { name: 'Reload' }).click();
  await p.waitForLoadState('load'); await sleep(2500);
  await p.waitForSelector('main');
  const after = await p.goto(`http://localhost:${PORT}/settings`).then(() => p.waitForSelector('text=/Version \\d/')).then(() => p.locator('main').textContent());
  ok('Reload swaps to the new version', /build bbbbbbb/.test(after), (after.match(/build [0-9a-z]+/) ?? [''])[0]);
  ok('no prompt after updating', !(await promptShown()));
} finally {
  await b.close(); server.kill(); fs.rmSync(OUT, { recursive: true, force: true });
}
const pass = out.filter((l) => l.startsWith('PASS')).length; const fail = out.filter((l) => l.startsWith('FAIL')).length;
console.log(`${pass} pass, ${fail} fail`);
