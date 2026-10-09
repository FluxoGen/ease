// QA app/audit: the Android app layout in a browser (?app=1): axe, headings, names, tap targets, overflow on every route at
// 412x915 light/dark, 360x640, 915x412 landscape and an 820x1180 tablet.
// Needs the dev server: npm run dev  (QA_DEV, default http://localhost:5183)
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

import { DEV, outPath, points as pts, routineIds } from '../lib/env.mjs';
const B = DEV;
const findings = [];
const add = (area, msg) => findings.push(`[${area}] ${msg}`);

const b = await chromium.launch();
const mk = async (scheme, w, h, status = 'no', extra = {}) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: w < 1000, isMobile: w < 1000, ...extra });
  if (status) await ctx.addInitScript((s) => localStorage.setItem('ease.pregnancyStatus', s), status);
  await ctx.addInitScript(() => sessionStorage.setItem('ease.app', '1'));
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', (e) => p.errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') p.errs.push(m.type() + ': ' + m.text().slice(0, 140)); });
  p.on('requestfailed', (r) => p.errs.push('requestfailed: ' + r.url().slice(0, 100)));
  p.on('response', (r) => { if (r.status() >= 400) p.errs.push(`http ${r.status()}: ${r.url().slice(0, 100)}`); });
  return [ctx, p];
};

// ---------- 3. Per-page deep checks, all routes, light + dark, phone + desktop
const pages = [
  '/', '/map', '/points', '/points?area=foot', '/points?q=head', '/safety', '/safety#locations', '/settings', '/about',
  ...routineIds.map((r) => '/routine/' + r),
  '/point/pc6', '/point/lu7', '/point/st9', '/point/ex-ue9', '/point/ex-hn5', '/point/gb32', '/point/cv13', '/point/bl40', '/point/ki11', '/point/st25',
];
const deep = async (p, u, tag, w) => {
  await p.goto(B + u); await p.waitForSelector('h1', { timeout: 6000 }).catch(() => add(tag, `${u}: no h1`)); await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const vis = (el) => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !el.closest('[aria-hidden=true]'); };
    const o = { h: [], noName: [], imgs: [], links: [], small: [], whites: [], overflow: document.documentElement.scrollWidth - innerWidth };
    // headings
    const hs = [...document.querySelectorAll('h1,h2,h3,h4')].filter(vis); let last = 0;
    for (const h of hs) { const lv = +h.tagName[1]; if (last && lv > last + 1) o.h.push(`skip h${last}->h${lv} "${h.textContent.trim().slice(0, 24)}"`); last = lv; }
    if (document.querySelectorAll('h1').length !== 1) o.h.push(`h1 count ${document.querySelectorAll('h1').length}`);
    // names
    for (const el of document.querySelectorAll('a[href],button,[role=button],input,select')) {
      if (!vis(el) && el.tagName !== 'INPUT') continue;
      const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent || el.getAttribute('title') || el.getAttribute('placeholder') || '').trim();
      if (!name && !(el.labels && el.labels.length)) o.noName.push(el.outerHTML.slice(0, 70));
    }
    // images
    for (const img of document.querySelectorAll('img')) if (vis(img) && (!img.complete || img.naturalWidth === 0)) o.imgs.push(img.src.slice(-40));
    // links
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href');
      if (h === '#' || h === '' || h.startsWith('javascript')) o.links.push('dead ' + h);
      if (/^https?:/.test(h) && a.target === '_blank' && !/noopener|noreferrer/.test(a.rel)) o.links.push('no rel ' + h.slice(0, 40));
    }
    // tap targets
    for (const el of document.querySelectorAll('a[href],button,[role=button],input,select,summary')) {
      if (!vis(el)) continue; const rc = el.getBoundingClientRect();
      if (el.closest('svg') ) continue;
      if (rc.height < 43.5 || rc.width < 43.5) o.small.push(`${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 26)} ${Math.round(rc.width)}x${Math.round(rc.height)}`);
    }
    // pure white / near-white surfaces that aren't photos (dark mode glare)
    if (matchMedia('(prefers-color-scheme: dark)').matches) for (const el of document.querySelectorAll('body *')) {
      if (!vis(el) || el.closest('svg') || el.closest('.photo') || el.tagName === 'IMG') continue;
      const bg = getComputedStyle(el).backgroundColor; if (/rgb\(2[45]\d, 2[45]\d, 2[45]\d\)|rgb\(255, 255, 255\)/.test(bg)) o.whites.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ').slice(0, 3).join('.'));
    }
    return o;
  });
  const tt = (x) => [...new Set(x)].slice(0, 5).join(' | ');
  if (r.overflow > 1) add(tag, `${u}: horizontal overflow ${r.overflow}px`);
  if (r.h.length) add(tag, `${u}: headings: ${tt(r.h)}`);
  if (r.noName.length) add(tag, `${u}: no accessible name: ${tt(r.noName)}`);
  if (r.imgs.length) add(tag, `${u}: broken images: ${tt(r.imgs)}`);
  if (r.links.length) add(tag, `${u}: links: ${tt(r.links)}`);
  if (r.whites.length) add(tag, `${u}: bright surfaces in dark mode: ${tt(r.whites)}`);
  const small = r.small.filter((s) => w < 1000);
  if (small.length) add(tag, `${u}: small tap targets: ${tt(small)}`);
  const ax = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  for (const v of ax.violations) add(tag, `${u}: axe ${v.id} (${v.impact}): ${v.nodes[0].html.slice(0, 90)}`);
  if (p.errs.length) { add(tag, `${u}: console/network: ${tt(p.errs)}`); p.errs.length = 0; }
};
for (const [scheme, w, h, tag] of [['light', 412, 915, 'app-phone-light'], ['dark', 412, 915, 'app-phone-dark'], ['light', 360, 640, 'app-small'], ['light', 915, 412, 'app-landscape'], ['dark', 820, 1180, 'app-tablet-dark']]) {
  const [ctx, p] = await mk(scheme, w, h);
  for (const u of pages) await deep(p, u, tag, w);
  await ctx.close(); console.log('done', tag);
}

fs.writeFileSync(outPath('app-audit-findings.txt'), findings.join('\n'));
console.log('FINDINGS', findings.length); console.log(findings.slice(0, 80).join('\n'));
await b.close();
