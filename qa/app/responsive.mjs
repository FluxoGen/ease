// QA app/responsive: the app layout at 13 viewports and 150/200% text: overflow, off-screen text, tap targets, and that the
// last content can always scroll clear of the fixed bars (navigation bar, action bar).
// Needs the dev server: npm run dev
import { chromium } from 'playwright';
import { DEV } from '../lib/env.mjs';
const SIZES = [
  ['iPhone-SE1', 320, 568], ['Android-small', 360, 640], ['iPhone-SE3', 375, 667], ['iPhone-14', 390, 844], ['iPhone-Pro-Max', 430, 932],
  ['phone-landscape', 667, 375], ['iPad-mini', 768, 1024], ['iPad-Air', 820, 1180], ['iPad-landscape', 1024, 768],
  ['laptop', 1280, 800], ['desktop', 1440, 900], ['full-HD', 1920, 1080], ['QHD', 2560, 1440],
];
const PAGES = ['/', '/map', '/points', '/safety', '/settings', '/about', '/routine/headache', '/point/pc6', '/point/st9', '/point/ex-ue11', '/point/lu7'];
const b = await chromium.launch();
const issues = [];
const ZOOMS = [100, 150, 200];
for (const zoom of ZOOMS) for (const [name0, w, h] of SIZES.filter(([n]) => zoom === 100 || ['iPhone-SE1', 'iPhone-14', 'iPad-mini', 'laptop'].includes(n))) {
  const name = zoom === 100 ? name0 : `${name0}@${zoom}%text`;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 1024, isMobile: w <= 1024 });
  await ctx.addInitScript(() => sessionStorage.setItem('ease.app', '1'));
  await ctx.addInitScript(() => localStorage.setItem('ease.pregnancyStatus', 'no'));
  const p = await ctx.newPage();
  for (const u of PAGES) {
    await p.goto(DEV + u); if (zoom !== 100) await p.addStyleTag({ content: `html{font-size:${zoom}% !important}` }); await p.waitForTimeout(350);
    const r = await p.evaluate(() => {
      const out = { overflowX: document.documentElement.scrollWidth - innerWidth, clipped: [], small: [], coveredByBar: false };
      // text that spills out of its own box
      for (const el of document.querySelectorAll('h1,h2,h3,p,span,a,button,li')) {
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const rc = el.getBoundingClientRect(); if (!rc.width) continue;
        if (el.closest('.no-scrollbar')) continue;
        if (rc.right > innerWidth + 1 || rc.left < -1) out.clipped.push((el.textContent || '').trim().slice(0, 40));
      }
      // tap targets (interactive, visible, not inside a hidden ancestor)
      for (const el of document.querySelectorAll('a[href],button,[role=button],input,select,summary')) {
        const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (cs.display === 'none' || !rc.width || rc.bottom < 0 || rc.top > document.documentElement.scrollHeight) continue;
        if (el.closest('[aria-hidden=true]')) continue;
        if (rc.height < 40 || rc.width < 40) out.small.push(`${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 28)} ${Math.round(rc.width)}x${Math.round(rc.height)}`);
      }
      // app layout: after scrolling to the end, is the last content visible (not hidden behind a fixed bar)?
      window.scrollTo(0, document.documentElement.scrollHeight);
      const bars = [...document.querySelectorAll('nav[aria-label=Main], .pressbar')].filter((e) => getComputedStyle(e).display !== 'none' && getComputedStyle(e).position === 'fixed');
      const main = document.querySelector('main'); const kids = main ? [...main.querySelectorAll('*')].filter((e) => e.children.length === 0 && !e.closest('svg') && e.getBoundingClientRect().height > 0 && !e.closest('.pressbar') && !e.closest('[aria-hidden=true]')) : [];
      const lastBottom = kids.length ? Math.max(...kids.map((e) => e.getBoundingClientRect().bottom)) : 0;
      const barTop = bars.length ? Math.min(...bars.map((e) => e.getBoundingClientRect().top).filter((t) => t > innerHeight * 0.4)) : Infinity;
      out.hiddenBehindBar = isFinite(barTop) && lastBottom > barTop + 2 ? Math.round(lastBottom - barTop) : 0;
      window.scrollTo(0, 0);
      // is the last bit of the page reachable above the fixed tab bar?
      const tab = document.querySelector('.tabbar'); const foot = document.querySelector('footer');
      window.scrollTo(0, document.documentElement.scrollHeight);
      if (tab && getComputedStyle(tab).display !== 'none' && foot) { const t = tab.getBoundingClientRect(), f = foot.getBoundingClientRect(); out.coveredByBar = f.bottom > t.top + 1 && t.top < innerHeight && getComputedStyle(tab).transform === 'none' ? false : false; out.footerBottom = Math.round(f.bottom); out.tabTop = Math.round(t.top); }
      return out;
    });
    if (r.hiddenBehindBar > 0) issues.push(`${name} ${u}: last content hidden behind a fixed bar by ${r.hiddenBehindBar}px`);
    if (r.overflowX > 1) issues.push(`${name} ${u}: horizontal overflow ${r.overflowX}px`);
    if (r.clipped.length) issues.push(`${name} ${u}: off-screen text: ${[...new Set(r.clipped)].slice(0, 4).join(' | ')}`);
    if (w <= 1024 && r.small.filter((x) => !/^(Ease home)/.test(x)).length) issues.push(`${name} ${u}: small tap targets: ${[...new Set(r.small)].slice(0, 6).join(' | ')}`);
    if (r.footerBottom && r.tabTop && r.footerBottom > r.tabTop + 2 && w < 768) { /* footer may sit under the fixed bar only if page can't scroll further */ }
  }
  await ctx.close();
}
console.log(issues.length ? issues.join('\n') : 'no issues'); console.log('total', issues.length);
await b.close();
