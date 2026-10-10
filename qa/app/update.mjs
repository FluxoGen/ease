// QA app/update: the "new version available" prompt UI in the app layout and the website layout, through the dev-only
// preview flag (?update=available|downloading|ready). Real Google Play updates cannot run in a browser or an emulator; this
// covers the states, behaviour, tap targets and accessibility. Needs the dev server: npm run dev
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { DEV } from '../lib/env.mjs';

const out = []; const ok = (n, c, d = '') => { const l = `${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`; out.push(l); console.log(l); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch();
const mk = async (scheme, w, h, mobile = true) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: mobile, isMobile: mobile && w < 800 });
  await ctx.addInitScript(() => localStorage.setItem('ease.pregnancyStatus', 'no'));
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(e.message)); return [ctx, p];
};
const card = (p) => p.getByRole('status', { name: 'App update' });

for (const [label, query, update] of [['app (Play)', 'app=1&', 'Update'], ['website', '', 'Reload']]) {
  const [ctx, p] = await mk('light', 412, 915);
  await p.goto(`${DEV}/?${query}update=available`); await sleep(700);
  ok(`${label}: prompt shows`, await card(p).isVisible() && await p.getByText('A new version of Ease is available').isVisible());
  const btns = await card(p).getByRole('button').evaluateAll((els) => els.map((e) => ({ t: e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) })));
  ok(`${label}: buttons are "Later" and "${update}", each at least 44 px tall`, btns.map((x) => x.t).join() === `Later,${update}` && btns.every((x) => x.h >= 44), JSON.stringify(btns));
  const bar = await card(p).boundingBox();
  ok(`${label}: card sits fully on screen`, bar.x >= 0 && bar.x + bar.width <= 412 && bar.y >= 0 && bar.y + bar.height <= 915);
  const ax = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  ok(`${label}: no accessibility violations (axe)`, ax.violations.length === 0, ax.violations.map((v) => v.id).join());
  await card(p).getByRole('button', { name: 'Later' }).click(); await sleep(300);
  ok(`${label}: "Later" hides it`, !(await card(p).isVisible().catch(() => false)));
  ok(`${label}: no page errors`, p.errs.length === 0, p.errs.join('|'));
  await ctx.close();
}

// Play flow: Update -> downloading with progress -> ready -> Restart
{
  const [ctx, p] = await mk('light', 412, 915);
  await p.goto(`${DEV}/?app=1&update=available`); await sleep(600);
  await card(p).getByRole('button', { name: 'Update' }).click(); await sleep(400);
  ok('Play flow: Update starts the download (title, progress bar, no buttons)', await p.getByText('Downloading update').isVisible() && await p.getByRole('progressbar').isVisible() && await card(p).getByRole('button').count() === 0);
  for (let i = 0; i < 20 && !(await p.getByText('Update ready').isVisible().catch(() => false)); i++) await sleep(400);
  ok('Play flow: when the download finishes it asks to Restart', await p.getByText('Update ready').isVisible() && await card(p).getByRole('button', { name: 'Restart' }).isVisible());
  ok('Play flow: a finished update has no "Later" (restart is the only step)', await card(p).getByRole('button', { name: 'Later' }).count() === 0);
  await ctx.close();
}
{
  const [ctx, p] = await mk('light', 412, 915);
  await p.goto(`${DEV}/?app=1&update=downloading`); await sleep(600);
  ok('downloading state shows progress at 40%', (await p.getByRole('progressbar').getAttribute('aria-valuenow')) === '40');
  await ctx.close();
}

// It must not sit on top of the guided press.
{
  const [ctx, p] = await mk('light', 412, 915);
  await p.goto(`${DEV}/?app=1&update=available`); await sleep(500);
  await p.evaluate(() => { history.pushState({}, '', '/point/pc6'); dispatchEvent(new PopStateEvent('popstate')); }); await sleep(800);
  await p.getByRole('button', { name: /Start press/ }).last().click(); await sleep(700);
  const top = await p.evaluate(() => { const r = document.querySelector('[role=status][aria-label="App update"]').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!el?.closest('[role=dialog]'); });
  ok('the guided press screen stays above the prompt (it never interrupts a press)', top);
  await ctx.close();
}

// Dark mode and wide screens
{
  const [ctx, p] = await mk('dark', 1280, 800, false);
  await p.goto(`${DEV}/?app=1&update=available`); await sleep(700);
  const bb = await card(p).boundingBox();
  ok('wide screen: the card docks at the right edge', bb.x + bb.width > 1280 - 40 && bb.x > 640, `x=${Math.round(bb.x)} w=${Math.round(bb.width)}`);
  const ax = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  ok('dark mode: no accessibility violations (axe)', ax.violations.length === 0, ax.violations.map((v) => v.id).join());
  await ctx.close();
}
{
  const [ctx, p] = await mk('light', 320, 568);
  await p.goto(`${DEV}/?app=1&update=available`); await sleep(500);
  await p.addStyleTag({ content: 'html{font-size:200% !important}' }); await sleep(300);
  const r = await p.evaluate(() => ({ of: document.documentElement.scrollWidth - innerWidth, card: (() => { const b = document.querySelector('[aria-label="App update"]').getBoundingClientRect(); return b.right <= innerWidth + 1 && b.left >= -1; })() }));
  ok('320 px wide at 200% text: no sideways scroll and the card fits', r.of <= 1 && r.card, JSON.stringify(r));
  await ctx.close();
}
await b.close();
console.log(`${out.filter((l) => l.startsWith('PASS')).length} pass, ${out.filter((l) => l.startsWith('FAIL')).length} fail`);
