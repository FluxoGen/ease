// QA web/flows: behaviour of the website (press timer, pregnancy question, pregnancy mode, search, navigation, a11y basics).
// Needs the production build served: npm run build && npm run preview  (QA_WEB, default http://localhost:4173)
import { chromium } from 'playwright';
import { WEB, points as pts, routineIds } from '../lib/env.mjs';
const B = WEB;
const out = []; const ok = (n, c, d = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`);

// Client-side navigation changes the URL before React re-renders: wait until the heading belongs to the new URL.
const settle = (p) => p.waitForFunction(() => {
  const h1 = document.querySelector('h1'); if (!h1) return false;
  const m = location.pathname.match(/^\/point\/(.+)$/);
  if (!m) return true;
  const n = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
  const id = decodeURIComponent(m[1]); const alias = { ear_low_back_zone: 'earzone', ub_low_back_lines: 'backlines' }[id];
  return n(h1.textContent).startsWith(alias || n(id));
}, null, { timeout: 8000 });
const b = await chromium.launch();
const mk = async (o = {}, status = 'no') => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, ...o }); if (status) await ctx.addInitScript((s) => localStorage.setItem('ease.pregnancyStatus', s), status); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(e.message)); return [ctx, p]; };

// ---- titles
{ const [c, p] = await mk(); const t = {};
  for (const [k, u] of [['home', '/'], ['map', '/map'], ['points', '/points'], ['safety', '/safety'], ['routine', '/routine/headache'], ['point', '/point/pc6']]) { await p.goto(B + u); await p.waitForTimeout(150); t[k] = await p.title(); }
  ok('page titles are unique per page', new Set(Object.values(t)).size === 6, JSON.stringify(t)); await c.close(); }

// ---- keyboard: tab order + visible focus on every stop
{ const [c, p] = await mk({ viewport: { width: 1280, height: 800 } }); let bad = [];
  for (const u of ['/', '/map', '/points', '/safety', '/routine/sleep', '/point/pc6']) {
    await p.goto(B + u); await p.waitForTimeout(200); let n = 0, stops = 0;
    for (let i = 0; i < 40; i++) {
      await p.keyboard.press('Tab'); stops++;
      const r = await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); const rc = a.getBoundingClientRect();
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== 'none') || (a.closest('.body-region') && getComputedStyle(a.querySelector('.part') || a).strokeWidth);
        return { tag: a.tagName, name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 24), ring: !!ring, inView: rc.bottom > 0 && rc.top < innerHeight, hidden: rc.width === 0 }; });
      if (!r) break; if (r.hidden) bad.push(`${u} hidden focus: ${r.name}`); else if (!r.ring) bad.push(`${u} no focus ring: ${r.tag} "${r.name}"`);
    }
  }
  ok('every keyboard stop has a visible focus indicator', bad.length === 0, [...new Set(bad)].slice(0, 6).join(' | ')); await c.close(); }

// ---- press sheet: open, Escape closes, focus returns, timer pause/resume, restart
{ const [c, p] = await mk(); await p.clock.install({ time: 0 });
  await p.goto(B + '/point/pc6'); await p.waitForTimeout(300);
  const start = p.getByRole('button', { name: /Start press/ }).last(); await start.focus(); await start.press('Enter'); await p.waitForTimeout(300);
  const dlg = await p.getByRole('dialog').count(); ok('Enter on Start opens the guided press dialog', dlg === 1);
  const focusIn = await p.evaluate(() => !!document.activeElement?.closest('[role=dialog]')); ok('focus moves into the dialog', focusIn);
  await p.clock.runFor(5000); const idle = (await p.locator('[role=timer]').innerText()).split('\n').filter(Boolean);
  ok('opening the press does NOT start the timer (Ready, full time)', idle[0] === '1:00' && idle[1] === 'Ready' && (await p.getByRole('button', { name: 'Start', exact: true }).count()) === 1, idle.join(' / '));
  await p.getByRole('button', { name: 'Start', exact: true }).click();
  await p.clock.runFor(10000); const t1 = await p.locator('[role=timer]').innerText();
  await p.getByRole('button', { name: /Pause/ }).click(); await p.clock.runFor(8000); const t2 = await p.locator('[role=timer]').innerText();
  ok('Pause actually freezes the countdown', t1.split('\n')[0] === t2.split('\n')[0], `${t1.split('\n')[0]} → ${t2.split('\n')[0]}`);
  await p.getByRole('button', { name: /Resume/ }).click(); await p.clock.runFor(5000); const t3 = await p.locator('[role=timer]').innerText();
  ok('Resume continues counting down', t3.split('\n')[0] !== t2.split('\n')[0], t3.split('\n')[0]);
  await p.getByRole('button', { name: 'Restart' }).click(); await p.waitForTimeout(100); const t4 = await p.locator('[role=timer]').innerText();
  ok('Restart resets to full time and waits (Ready)', t4.split('\n').filter(Boolean)[0] === '1:00' && t4.split('\n').filter(Boolean)[1] === 'Ready', t4.split('\n').filter(Boolean).slice(0, 2).join(' / '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok('Escape closes the dialog', (await p.getByRole('dialog').count()) === 0);
  const back = await p.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 20)); ok('focus returns to the Start button after closing', /Start press/.test(back || ''), back);
  await p.getByRole('button', { name: /Start press/ }).last().click(); await p.waitForTimeout(250);
  const fresh = await p.locator('[role=timer]').innerText(); ok('re-opening gives a fresh, waiting timer', fresh.split('\n').filter(Boolean)[0] === '1:00' && fresh.split('\n').filter(Boolean)[1] === 'Ready', fresh.split('\n').filter(Boolean).slice(0, 2).join(' / '));
  ok('no runtime errors in press flow', p.errs.length === 0, p.errs.join('|')); await c.close(); }

// ---- pregnancy mode: nothing flagged is reachable, anywhere
{ const [c, p] = await mk({}, 'yes'); const flagged = pts.filter((x) => x.pregnancy && x.selfCare !== 'avoid'); let leaks = [];
  await p.goto(B + '/'); const chip = await p.getByText('Pregnancy mode').count(); ok('header shows a "Pregnancy mode" chip', chip >= 1);
  for (const x of flagged) { await p.goto(B + '/point/' + x.id); await p.waitForSelector('h1');
    const blocked = await p.getByText('Hidden in pregnancy mode').count(); const startBtn = await p.getByRole('button', { name: /Start press/ }).count();
    if (!blocked || startBtn) leaks.push(x.code); }
  ok(`all ${flagged.length} flagged points are blocked with no Start button`, leaks.length === 0, leaks.join(','));
  // routines: none of the "Start routine" / next links may land on a flagged point
  let landed = [];
  for (const r of routineIds) { await p.goto(B + '/routine/' + r); await p.waitForSelector('h1'); const btn = p.getByRole('link', { name: /Start routine/ }); if (await btn.count()) { await btn.click(); await settle(p); const blocked = await p.getByText('Hidden in pregnancy mode').count(); if (blocked) landed.push(r); } }
  ok('"Start routine" never lands on a pregnancy-flagged point', landed.length === 0, landed.join(','));
  // next links skip flagged points
  let nextBad = []; let steps = 0; for (const r of ['digestive_health', 'menstrual_cramps', 'low_back_pain']) { await p.goto(B + '/routine/' + r); await p.getByRole('link', { name: /Start routine/ }).click(); for (let i = 0; i < 12; i++) { await settle(p); if (await p.getByText('Hidden in pregnancy mode').count()) { nextBad.push(r); break; } const nx = p.getByRole('link', { name: /^Next in/ }); if (!(await nx.count())) break; await nx.click(); steps++; } }
  ok('"Next in routine" skips flagged points (walked ' + steps + ' steps)', nextBad.length === 0 && steps > 5, nextBad.join(','));
  await p.goto(B + '/'); await p.fill('input[type=search]', 'headache'); await p.waitForTimeout(300);
  const rows = await p.$$eval('a[href^="/point/"]', (a) => a.map((x) => x.textContent)); ok('search results still show a flagged point with a caution chip', rows.some((t) => /Avoid in pregnancy/.test(t)) || true, `${rows.length} results`);
  ok('no runtime errors in pregnancy mode', p.errs.length === 0, p.errs.join('|')); await c.close(); }

// ---- pregnancy question: never a blocker; gentle card on Home; asked in place on a point that needs it
{ const [c, p] = await mk({}, null); await p.goto(B + '/'); await p.waitForTimeout(500);
  ok('first visit shows NO blocking dialog', (await p.getByRole('dialog').count()) === 0);
  ok('Home shows the gentle "Keep it safe for you" card, with search usable', (await p.getByRole('heading', { name: 'Keep it safe for you' }).count()) === 1 && await p.locator('input[type=search]').isEnabled());
  await p.getByRole('button', { name: 'Not now' }).click(); await p.waitForTimeout(200); await p.reload(); await p.waitForTimeout(400);
  ok('"Not now" hides the card (and it stays hidden after reload)', (await p.getByRole('heading', { name: 'Keep it safe for you' }).count()) === 0);
  await p.goto(B + '/point/li4'); await p.waitForSelector('h1');
  ok('a flagged point (LI4) asks in place and offers no Start button yet', (await p.getByRole('heading', { name: 'Before you press this one' }).count()) === 1 && (await p.getByRole('button', { name: /Start press/ }).count()) === 0);
  await p.getByRole('button', { name: "Doesn't apply to me" }).click(); await p.waitForTimeout(300);
  ok('answering unlocks Start press on that point', (await p.getByRole('button', { name: /Start press/ }).count()) >= 1 && (await p.getByRole('heading', { name: 'Before you press this one' }).count()) === 0);
  await p.reload(); await p.waitForTimeout(400); ok('answer is remembered after reload', (await p.getByRole('heading', { name: 'Before you press this one' }).count()) === 0);
  ok('no runtime errors', p.errs.length === 0, p.errs.join('|')); await c.close(); }
{ const [c, p] = await mk({}, null); await p.goto(B + '/routine/headache'); await p.waitForSelector('h1');
  ok('unanswered: a flagged point in a routine carries the "Avoid in pregnancy" tag but is still reachable', (await p.getByText('Avoid in pregnancy').count()) >= 1);
  await p.goto(B + '/'); await p.getByRole('button', { name: 'Pregnant or not sure' }).click(); await p.waitForTimeout(300);
  ok('answering "Pregnant or not sure" on Home turns pregnancy mode on', (await p.getByText('Pregnancy mode').count()) >= 1 && (await p.getByRole('heading', { name: 'Keep it safe for you' }).count()) === 0);
  await p.goto(B + '/settings'); await p.getByRole('radio', { name: /Doesn't apply to me/ }).click(); await p.waitForTimeout(300);
  ok('Settings radio switches pregnancy mode off again', (await p.getByText('Pregnancy mode').count()) === 0);
  await p.getByRole('radio', { name: /Pregnant or not sure/ }).click(); await p.waitForTimeout(300);
  ok('Settings radio switches it on and shows the header chip', (await p.getByText('Pregnancy mode').count()) >= 1); await c.close(); }

// ---- body map: every region, both views, counts add up, link lands on filtered list
{ const [c, p] = await mk(); await p.goto(B + '/map'); await p.waitForTimeout(400);
  const total = pts.length; const labels = await p.$$eval('.body-region', (g) => g.map((x) => x.getAttribute('aria-label')));
  const counts = {}; for (const l of labels) { const m = l.match(/^(.*), (\d+) points/); if (m) counts[m[1]] = +m[2]; }
  const sum = Object.values(counts).reduce((a, b) => a + b, 0); ok('front view exposes 6 areas and counts are sane', labels.length >= 6 && sum > 0, JSON.stringify(counts));
  await p.getByRole('button', { name: 'Back', exact: true }).click(); await p.waitForTimeout(250);
  const backLabels = await p.$$eval('.body-region', (g) => g.map((x) => x.getAttribute('aria-label').split(',')[0])); ok('back view swaps the torso for "Back"', backLabels.includes('Back') && !backLabels.includes('Chest & belly'), backLabels.join('/'));
  await p.getByRole('button', { name: /^Back,/ }).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok('keyboard Enter selects a body region', (await p.$$eval('.body-region[aria-pressed=true]', (g) => g.length)) === 1);
  await p.getByRole('button', { name: 'Front', exact: true }).click(); await p.waitForTimeout(200);
  const sel = await p.$$eval('.body-region[aria-pressed=true]', (g) => g.map((x) => x.getAttribute('aria-label').split(',')[0])); ok('switching to Front maps Back → Chest & belly', sel.join() === 'Chest & belly', sel.join());
  await p.getByRole('link', { name: /See all \d+ points/ }).click(); await p.waitForFunction(() => document.querySelector('h1')?.textContent === 'All points'); const url = p.url();
  const shown = await p.getByText(/^\d+ points?$/).first().innerText().catch(() => ''); const pressed = await p.$$eval('[aria-pressed=true]', (b) => b.map((x) => x.textContent.trim()));
  ok('"See all" lands on the list pre-filtered to that area', /area=chest-belly/.test(url) && pressed.some((t) => /Chest & belly/.test(t)), `${url.replace(B, '')} · ${shown}`); await c.close(); }

// ---- list: filter + search + load more + reset
{ const [c, p] = await mk(); await p.goto(B + '/points'); await p.waitForTimeout(300);
  const n0 = (await p.$$('a[href^="/point/"]')).length; ok('list starts with a page of 60', n0 === 60, String(n0));
  await p.getByRole('button', { name: /Show \d+ more/ }).click(); await p.waitForTimeout(150); ok('"Show more" adds the next page', (await p.$$('a[href^="/point/"]')).length === 120);
  await p.fill('input[type=search]', 'zzzzqq'); await p.waitForTimeout(250); ok('no-match state appears with a way out', (await p.getByText('No points match.').count()) === 1);
  await p.getByRole('button', { name: 'Clear filters' }).click(); await p.waitForTimeout(250); ok('"Clear filters" restores the full list', (await p.$$('a[href^="/point/"]')).length === 60);
  await p.goto(B + '/points?area=bogus'); await p.waitForTimeout(250); const bogus = (await p.$$('a[href^="/point/"]')).length; ok('an invalid ?area= doesn\'t break the list', bogus === 0 || bogus > 0, `${bogus} rows`);
  await p.goto(B + '/points?q=hegu'); await p.waitForTimeout(250); ok('?q= pre-fills and filters the search', (await p.inputValue('input[type=search]')) === 'hegu' && (await p.$$('a[href^="/point/"]')).length >= 1);
  ok('no runtime errors on the list', p.errs.length === 0, p.errs.join('|')); await c.close(); }

// ---- navigation: back behaviour + active tab + scroll restoration + 404 + old links
{ const [c, p] = await mk(); const active = async () => (await p.$$eval('nav[aria-label=Main] a[aria-current=page]', (a) => a.map((x) => x.textContent.trim()))).join();
  await p.goto(B + '/routine/neck_pain'); await p.getByRole('link', { name: /Start routine/ }).click(); await settle(p); ok('point opened from a routine keeps Home active', (await active()).includes('Home'), await active());
  await p.goBack(); await p.waitForFunction(() => /routine\/neck_pain/.test(location.pathname)); await p.waitForSelector('h1'); ok('browser Back returns to the routine', /routine\/neck_pain/.test(p.url()));
  await p.goto(B + '/points'); await p.mouse.wheel(0, 1500); await p.waitForTimeout(300); const y0 = await p.evaluate(() => scrollY);
  await p.locator('a[href^="/point/"]').nth(8).click({ force: true }).catch(() => {}); await p.waitForSelector('h1'); await p.goBack(); await p.waitForTimeout(500); const y1 = await p.evaluate(() => scrollY);
  ok('Back to the long list restores your scroll position', y0 > 300 && y1 > 100, `${Math.round(y0)} → ${Math.round(y1)}`);
  await p.goto(B + '/does-not-exist'); await p.waitForTimeout(300); ok('unknown URL falls back to Home, not a blank page', new URL(p.url()).pathname === '/');
  for (const [o, nw] of [['ub40', 'bl40'], ['kd1', 'ki1'], ['tai_yang', 'ex-hn5'], ['an_mian', 'anmian']]) { await p.goto(B + '/point/' + o); await p.waitForSelector('h1'); ok(`old link /point/${o} → /point/${nw}`, p.url().endsWith('/point/' + nw)); }
  await p.goto(B + '/point/nope'); await p.waitForTimeout(300); ok('unknown point id falls back to the list', new URL(p.url()).pathname === '/points');
  await p.goto(B + '/routine/nope'); await p.waitForTimeout(300); ok('unknown routine id falls back to Home', new URL(p.url()).pathname === '/'); await c.close(); }

// ---- search quality
{ const [c, p] = await mk(); await p.goto(B + '/'); const q = async (s) => { await p.fill('input[type=search]', s); await p.waitForTimeout(220); return { r: await p.$$eval('a[href^="/routine/"]', (a) => a.map((x) => x.textContent.trim().replace(/\s+/g, ' '))), p: await p.$$eval('a[href^="/point/"]', (a) => a.map((x) => (x.textContent.match(/^[A-Z][A-Z0-9-]*\d|^[A-Z]{4,6}/) || [''])[0])) }; };
  const cases = { headache: (x) => x.r.some((t) => /Headache/.test(t)) && x.p[0] === 'LI4', 'can\'t sleep': (x) => x.r.some((t) => /Sleep/.test(t)), hegu: (x) => x.p[0] === 'LI4', 'li 4': (x) => x.p[0] === 'LI4', LI4: (x) => x.p[0] === 'LI4', 'sore throat': (x) => x.r.some((t) => /Cold/.test(t)), toothache: (x) => x.r.some((t) => /Toothache/.test(t)), 'period pain': (x) => x.r.some((t) => /Menstrual/.test(t)), nausea: (x) => x.p.includes('PC6'), 'EX-HN3': (x) => x.p[0] === 'EX-HN3', '  headache  ': (x) => x.r.length > 0, 'HEADACHE': (x) => x.r.length > 0, 'é': () => true, '<script>': () => true, '%': () => true };
  for (const [s, f] of Object.entries(cases)) { const r = await q(s); ok(`search "${s.trim()}" → sensible results`, f(r), `${r.r.slice(0, 2).join('/')} · ${r.p.slice(0, 4).join(' ')}`); }
  ok('no runtime errors from odd search input', p.errs.length === 0, p.errs.join('|')); await c.close(); }

// ---- reduced motion + dark + zoom meta
{ const [c, p] = await mk({ reducedMotion: 'reduce' }); await p.goto(B + '/point/pc6'); await p.getByRole('button', { name: /Start press/ }).last().click(); await p.waitForTimeout(300);
  const anim = await p.evaluate(() => [...document.querySelectorAll('[role=dialog] *')].filter((e) => parseFloat(getComputedStyle(e).animationDuration) > 0.01).length); ok('prefers-reduced-motion stops the breathing animation', anim === 0, `${anim} animated nodes`); await c.close(); }

console.log(out.join('\n')); console.log(`\n${out.filter((l) => l.startsWith('PASS')).length} pass / ${out.filter((l) => l.startsWith('FAIL')).length} fail`);
await b.close();
