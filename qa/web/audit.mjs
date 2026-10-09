// QA web/audit: document checks, page titles, and per-page checks (axe wcag2a/aa/21aa/22aa + best-practice, headings, names,
// images, links, tap targets, dark-mode glare, console errors) over every route, light/dark, phone/tablet/desktop.
// Needs the production build served: npm run build && npm run preview
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

import fs from 'node:fs';
import { WEB, outPath, points as pts, routineIds } from '../lib/env.mjs';
const B = WEB;
const findings = [];
const add = (area, msg) => findings.push(`[${area}] ${msg}`);

const b = await chromium.launch();
const mk = async (scheme, w, h, status = 'no', extra = {}) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, hasTouch: w < 1000, ...extra });
  if (status) await ctx.addInitScript((s) => localStorage.setItem('ease.pregnancyStatus', s), status);
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', (e) => p.errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') p.errs.push(m.type() + ': ' + m.text().slice(0, 140)); });
  p.on('requestfailed', (r) => p.errs.push('requestfailed: ' + r.url().slice(0, 100)));
  p.on('response', (r) => { if (r.status() >= 400) p.errs.push(`http ${r.status()}: ${r.url().slice(0, 100)}`); });
  return [ctx, p];
};

// ---------- 1. Static / document level
{
  const [ctx, p] = await mk('light', 390, 844);
  await p.goto(B + '/');
  const doc = await p.evaluate(() => ({
    lang: document.documentElement.lang, title: document.title,
    viewport: document.querySelector('meta[name=viewport]')?.content,
    theme: [...document.querySelectorAll('meta[name=theme-color]')].map((m) => m.content + '|' + (m.media || '')),
    desc: document.querySelector('meta[name=description]')?.content,
    manifest: document.querySelector('link[rel=manifest]')?.href,
    h1s: document.querySelectorAll('h1').length, mains: document.querySelectorAll('main').length,
  }));
  if (!doc.lang) add('doc', 'no <html lang>');
  if (/user-scalable=no|maximum-scale=1\b/.test(doc.viewport || '')) add('doc', 'viewport blocks zoom: ' + doc.viewport);
  if (doc.mains !== 1) add('doc', `main landmarks: ${doc.mains}`);
  console.log('doc', JSON.stringify(doc));
  const mf = await (await p.request.get(B + '/manifest.webmanifest')).json().catch(() => null);
  console.log('manifest', JSON.stringify(mf && { name: mf.name, short: mf.short_name, theme: mf.theme_color, bg: mf.background_color, display: mf.display, icons: mf.icons?.length }));
  if (mf) for (const ic of mf.icons || []) { const r = await p.request.get(B + '/' + ic.src.replace(/^\//, '')); if (r.status() !== 200) add('pwa', `icon ${ic.src} -> ${r.status()}`); }
  for (const u of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/og-image-1200x630.png']) { const r = await p.request.get(B + u); if (r.status() !== 200) add('assets', `${u} -> ${r.status()}`); }
  await ctx.close();
}

// ---------- 2. Page titles per route
{
  const [ctx, p] = await mk('light', 390, 844);
  const titles = new Set();
  for (const u of ['/', '/map', '/points', '/safety', '/routine/headache', '/point/pc6', '/point/st9']) { await p.goto(B + u); await p.waitForTimeout(150); titles.add(await p.title()); }
  console.log('distinct page titles across 7 routes:', titles.size, [...titles].slice(0, 3));
  if (titles.size < 4) add('titles', `only ${titles.size} distinct <title> across 7 routes (browser tabs/history/screen readers can't tell pages apart)`);
  await ctx.close();
}

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
for (const [scheme, w, h, tag] of [['light', 390, 844, 'phone-light'], ['dark', 390, 844, 'phone-dark'], ['light', 1280, 800, 'desk-light'], ['dark', 820, 1180, 'tab-dark']]) {
  const [ctx, p] = await mk(scheme, w, h);
  for (const u of pages) await deep(p, u, tag, w);
  await ctx.close(); console.log('done', tag);
}

fs.writeFileSync(outPath('web-audit-findings.txt'), findings.join('\n'));
console.log('FINDINGS', findings.length); console.log(findings.slice(0, 80).join('\n'));
await b.close();
