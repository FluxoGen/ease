// QA app/theme: light/dark/system on the website and the app layout: default, toggle, Appearance radios, persistence, live
// system change, explicit choice ignores system, browser chrome colour.
// Needs the dev server: npm run dev
import { chromium } from 'playwright';
import { DEV } from '../lib/env.mjs';
const b = await chromium.launch(); const out = []; const ok = (n, c, d = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n} ${d}`);
const bg = (p) => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
const LIGHT = 'rgb(246, 243, 236)', DARK = 'rgb(25, 23, 21)';
for (const [label, url, extra] of [['WEB', DEV + '/', {}], ['APP', DEV + '/?app=1', { isMobile: true, hasTouch: true }]]) {
  for (const sys of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, colorScheme: sys, ...extra });
    await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('ease.pregnancyStatus', 'no'); localStorage.removeItem('ease.theme'); sessionStorage.setItem('seeded', '1'); } });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(url); await p.waitForTimeout(600);
    ok(`${label} sys=${sys}: default follows system`, (await bg(p)) === (sys === 'dark' ? DARK : LIGHT));
    // header toggle
    const tog = p.getByRole('button', { name: /Switch to (dark|light) mode/ });
    await tog.first().click(); await p.waitForTimeout(300);
    ok(`${label} sys=${sys}: toggle flips theme`, (await bg(p)) === (sys === 'dark' ? LIGHT : DARK), await bg(p));
    ok(`${label} sys=${sys}: label updates`, await p.getByRole('button', { name: sys === 'dark' ? 'Switch to dark mode' : 'Switch to light mode' }).count() === 1);
    // persists across reload and routes
    await p.reload(); await p.waitForTimeout(600);
    ok(`${label} sys=${sys}: choice survives reload (no flash: set before render)`, (await bg(p)) === (sys === 'dark' ? LIGHT : DARK));
    await p.goto(url.replace(/\/(\?|$)/, '/settings$1')); await p.waitForTimeout(500);
    ok(`${label} sys=${sys}: choice survives navigation`, (await bg(p)) === (sys === 'dark' ? LIGHT : DARK));
    // Appearance card
    const radios = p.getByRole('radio', { name: /^(System|Light|Dark)$/ });
    ok(`${label} sys=${sys}: Appearance card has 3 options`, await radios.count() === 3);
    await p.getByRole('radio', { name: 'Dark' }).click(); await p.waitForTimeout(200);
    ok(`${label} sys=${sys}: Dark option`, (await bg(p)) === DARK && await p.getByRole('radio', { name: 'Dark' }).getAttribute('aria-checked') === 'true');
    await p.getByRole('radio', { name: 'Light' }).click(); await p.waitForTimeout(200);
    ok(`${label} sys=${sys}: Light option`, (await bg(p)) === LIGHT);
    await p.getByRole('radio', { name: 'System' }).click(); await p.waitForTimeout(200);
    ok(`${label} sys=${sys}: System option returns to system`, (await bg(p)) === (sys === 'dark' ? DARK : LIGHT));
    // live system change while on System
    await p.emulateMedia({ colorScheme: sys === 'dark' ? 'light' : 'dark' }); await p.waitForTimeout(300);
    ok(`${label} sys=${sys}: follows a live system change`, (await bg(p)) === (sys === 'dark' ? LIGHT : DARK));
    await p.emulateMedia({ colorScheme: sys });
    // explicit choice ignores system changes
    await p.getByRole('radio', { name: sys === 'dark' ? 'Light' : 'Dark' }).click(); await p.waitForTimeout(200);
    await p.emulateMedia({ colorScheme: sys === 'dark' ? 'light' : 'dark' }); await p.waitForTimeout(300);
    ok(`${label} sys=${sys}: explicit choice ignores system changes`, (await bg(p)) === (sys === 'dark' ? LIGHT : DARK));
    const meta = await p.evaluate(() => [...document.querySelectorAll('meta[name=theme-color]')].map((m) => m.content + '|' + m.media));
    ok(`${label} sys=${sys}: browser chrome colour follows choice`, meta.every((m) => m.startsWith(sys === 'dark' ? '#f6f3ec' : '#191715')), meta.join(' '));
    ok(`${label} sys=${sys}: no JS errors`, errs.length === 0, errs.join());
    await ctx.close();
  }
}
console.log(out.join('\n')); console.log(`${out.filter((l) => l.startsWith('PASS')).length} pass, ${out.filter((l) => l.startsWith('FAIL')).length} fail`);
await b.close();
