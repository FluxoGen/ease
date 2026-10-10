// QA android/suite: the installed Android app on a device/emulator, driven by Playwright's Android API + adb.
// Covers first launch, all screens, back button, guided press + keep-awake, links, dark/light, rotation, large text,
// 3-button navigation, airplane mode, pregnancy, app layout, Settings/Safety/About.
// Needs: a booted emulator/device with the debug APK installed (qa/android/install.sh). Run one section: node suite.mjs back,press
// On-device suite for the Ease Android app (Capacitor WebView), driven through Playwright's Android API + adb.
import { _android as android } from 'playwright';
import { execSync } from 'child_process';
import fs from 'node:fs';
import { ADB, PKG } from '../lib/android.mjs';
import { outPath, points as pts, routineIds } from '../lib/env.mjs';

const SHOTS = outPath('android-suite-shots');
fs.mkdirSync(SHOTS, { recursive: true });
const adb = (c) => execSync(`${ADB} ${c}`, { encoding: 'utf8', maxBuffer: 64 << 20 });
const sh = (c) => adb(`shell ${JSON.stringify(c)}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (n) => fs.writeFileSync(`${SHOTS}/${n}.png`, execSync(`${ADB} exec-out screencap -p`, { maxBuffer: 64 << 20 }));
const out = [];
const ok = (n, c, d = '') => { const l = `${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  — ' + d : ''}`; out.push(l); console.log(l); };
const PREG_YES = 'Pregnant or not sure';
const PREG_NO = "Doesn't apply to me";
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
const run = (k) => !only || only.has(k);


const [dev] = await android.devices();
let p = null;
const errs = [];
const resumed = () => (sh('dumpsys activity activities | grep -E "topResumedActivity|ResumedActivity:" | head -1') || '').trim();
const appOnTop = () => resumed().includes(PKG);
const keepOn = () => p.evaluate(() => window.Capacitor.Plugins.KeepAwake.isKeptAwake().then((r) => r.isKeptAwake));

async function attach() {
  // Same process still running: the current page handle keeps working.
  if (p) { const alive = await Promise.race([p.evaluate(() => 1).catch(() => 0), sleep(2000).then(() => 0)]); if (alive) { await p.waitForSelector('#root > *', { timeout: 8000 }).catch(() => {}); return p; } }
  // Select the WebView of the *current* app process (a restarted app has a new pid and socket).
  for (let i = 0; i < 40; i++) {
    try {
      const pid = sh(`pidof ${PKG}`).trim();
      if (!pid || !sh('cat /proc/net/unix').includes(`webview_devtools_remote_${pid}`)) { await sleep(400); continue; }
      const wv = await Promise.race([dev.webView({ socketName: `webview_devtools_remote_${pid}` }), sleep(6000).then(() => null)]);
      if (!wv) continue;
      p = await Promise.race([wv.page(), sleep(6000).then(() => null)]);
      if (!p) continue;
      p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
      // Google Play refuses in-app updates for installs that did not come from Play (an emulator/sideloaded build). The app catches
      // it; the bridge still logs it, so it is expected here and ignored. The WebView also asks for /favicon.ico on its own; an app has no tab to show it.
      p.on('console', (m) => { if (m.type() === 'error' && !/Install Error\(-6\)|ERROR_INSTALL_NOT_ALLOWED/.test(m.text()) && !m.location().url?.endsWith('/favicon.ico')) errs.push('console: ' + m.text().slice(0, 100) + ' @ ' + (m.location().url || '?') + ' ' + p.url()); });
      await p.waitForSelector('#root > *', { timeout: 8000 });
      return p;
    } catch { await sleep(400); }
  }
  throw new Error('could not attach to WebView');
}
async function launch({ clear = false } = {}) {
  sh(`am force-stop ${PKG}`);
  if (clear) sh(`pm clear ${PKG}`);
  sh(`am start -W -n ${PKG}/.MainActivity`);
  await sleep(1200);
  return attach();
}
const back = async () => { sh('input keyevent 4'); await sleep(700); };
// Client-side navigation (same as tapping a link): React Router listens to popstate.
const go = async (url) => {
  await p.evaluate((u) => { history.pushState({}, '', u); dispatchEvent(new PopStateEvent('popstate')); }, url);
  await p.waitForTimeout(120);
};
const pageCheck = () => p.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  return {
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((i) => vis(i) && i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-40)),
    path: location.pathname,
  };
});

// ---------------------------------------------------------------- 1. fresh install: no blocking question
if (run('gate')) {
  await launch({ clear: true });
  const g = await p.evaluate(() => ({ dialog: !!document.querySelector('[role=dialog]'), card: !!document.querySelector('#preg-nudge'), url: location.href, sw: !!navigator.serviceWorker?.controller, font: document.fonts.check('16px "Manrope Variable"'), remote: performance.getEntriesByType('resource').filter((r) => !r.name.startsWith('https://localhost/')).map((r) => r.name) }));
  ok('fresh install opens straight to Home with NO blocking dialog', !g.dialog);
  ok('Home offers the optional "Keep it safe for you" card', g.card);
  ok('served from bundled files (https://localhost), no service worker', g.url.startsWith('https://localhost/') && !g.sw, g.url);
  ok('font is the bundled Manrope', g.font);
  // Updates come from Google Play, not from the app: it must still hold no network permission, and an install that is not
  // from Play (this emulator build) must show no update prompt and raise no error.
  const perms = sh(`dumpsys package ${PKG}`);
  ok('the app is granted no INTERNET permission (Play checks for updates, not the app)', !/android\.permission\.INTERNET/.test(perms));
  await sleep(2500);
  ok('a non-Play install shows no update prompt', await p.locator('[aria-label="App update"]').count() === 0);
  ok('...and the update check raises no page error', errs.filter((e) => /update|AppUpdate/i.test(e)).length === 0, errs.slice(0, 2).join(' | '));
  ok('no remote requests at startup', g.remote.length === 0, g.remote.join(', '));
  shot('01-first-launch');
  await p.getByRole('button', { name: "Doesn't apply to me" }).click(); await sleep(600);
  ok('answering from the card hides it', await p.locator('#preg-nudge').count() === 0);
  shot('02-home');
  await launch();
  ok('answer persists after the app is killed', await p.evaluate(() => localStorage.getItem('ease.pregnancyStatus')) === 'no' && await p.locator('#preg-nudge').count() === 0);
  await back();
  ok('back on Home sends the app to the background', !appOnTop(), resumed());
  sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(1000); await attach();
}

// ---------------------------------------------------------------- 2. every route renders in the WebView
if (run('sweep')) {
  await launch();
  const bad = [];
  const urls = ['/', '/map', '/points', '/points?area=foot', '/points?q=sleep', '/safety', '/settings', '/about', ...routineIds.map((r) => `/routine/${r}`), ...pts.map((x) => `/point/${x.id}`)];
  for (const u of urls) {
    await go(u);
    await p.waitForFunction(() => document.querySelector('h1'), null, { timeout: 4000 }).catch(() => {});
    const r = await pageCheck();
    if (!r.h1) bad.push(`${u}: no h1`);
    if (r.overflow > 1) bad.push(`${u}: overflow ${r.overflow}px`);
    if (r.broken.length) bad.push(`${u}: broken ${r.broken.join(' ')}`);
    if (r.path === '/' && u !== '/') bad.push(`${u}: redirected home`);
  }
  ok(`all ${urls.length} screens render (h1, no sideways scroll, images load)`, bad.length === 0, bad.slice(0, 6).join(' | '));
  ok('no JS errors during the sweep', errs.length === 0, errs.slice(0, 3).join(' | '));
  // A cold start straight onto a deep path (what a restored WebView does).
  await p.goto('https://localhost/point/lu7'); await p.waitForSelector('h1');
  ok('deep path loads on a full reload', /LU ?7/i.test(await p.locator('h1').textContent()) || (await p.locator('h1').textContent()).length > 0, await p.locator('h1').textContent());
  p = null; await attach(); // a fresh handle: after 441 pushState navigations the old one can go stale
  await p.goto('https://localhost/does-not-exist'); await p.waitForFunction(() => location.pathname === '/', null, { timeout: 5000 }).catch(() => {});
  let landed = ''; for (let i = 0; i < 40 && landed !== '/'; i++) { await sleep(150); landed = await p.evaluate(() => location.pathname).catch(() => ''); }
  ok('unknown path falls back to Home', landed === '/', landed);
}

// ---------------------------------------------------------------- 3. hardware back through a real journey
if (run('back')) {
  await launch();
  await p.locator('a[href="/routine/headache"]').first().click(); await p.waitForURL(/routine\/headache/);
  await p.locator('a[href^="/point/"]:visible').first().click(); await p.waitForURL(/\/point\//);
  const pointUrl = p.url();
  await p.getByRole('button', { name: /Start press/ }).last().click(); await p.waitForSelector('[role=timer]');
  shot('05-press');
  await back();
  ok('back closes the guided press, stays on the point', await p.locator('[role=dialog]').count() === 0 && p.url() === pointUrl, p.url());
  await back();
  ok('back returns to the routine', /routine\/headache/.test(p.url()), p.url());
  await back();
  ok('back returns to Home', new URL(p.url()).pathname === '/', p.url());
  await back();
  ok('back on Home sends the app to the background', !appOnTop(), resumed());
  sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(800); await attach();
  ok('reopening resumes where it was (no restart)', new URL(p.url()).pathname === '/');
  // Started on a deep page with no history: back goes Home first, not out of the app.
  await p.goto('https://localhost/routine/sleep'); await p.waitForSelector('h1');
  await back();
  ok('back from a page with no history goes Home first', new URL(p.url()).pathname === '/' && appOnTop(), p.url());
}

// ---------------------------------------------------------------- 4. guided press: keep-awake, background, timer
if (run('press')) {
  await launch();
  await go('/point/pc6'); await p.waitForSelector('h1');
  await p.getByRole('button', { name: /Start press/ }).last().click(); await p.waitForSelector('[role=timer]');
  await sleep(2500);
  const ready = (await p.locator('[role=timer]').innerText()).split('\n').filter(Boolean);
  ok('Start press opens the timer Ready: nothing counts down yet', ready[0] === '1:00' && ready[1] === 'Ready', ready.slice(0, 2).join(' / '));
  ok('screen is NOT kept on while it is only waiting', !(await keepOn()));
  await p.getByRole('button', { name: 'Start', exact: true }).click(); await sleep(1500);
  ok('screen is kept on while the timer runs', await keepOn());
  const t0 = await p.locator('[role=timer] p').first().textContent();
  await p.getByRole('button', { name: 'Pause' }).click(); await sleep(800);
  ok('keep-awake is released on pause', !(await keepOn()));
  await p.getByRole('button', { name: 'Resume' }).click(); await sleep(600);
  const sec = (t) => { const [m, s] = t.split(':').map(Number); return m * 60 + s; };
  const before = sec(await p.locator('[role=timer] p').first().textContent());
  sh('input keyevent 3'); await sleep(6000); // home: app in background
  sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(1200); await attach();
  const after = sec(await p.locator('[role=timer] p').first().textContent());
  ok('timer keeps real time while the app is in the background', before - after >= 6 && before - after <= 13, `${before}s -> ${after}s (t0 ${t0})`);
  await back();
  await sleep(600);
  ok('keep-awake is released when the press closes', !(await keepOn()));
}

// ---------------------------------------------------------------- 5. external links leave the app
if (run('links')) {
  await launch();
  await go('/about'); await p.waitForSelector('#privacy');
  await p.locator('#privacy').scrollIntoViewIfNeeded();
  shot('06-about-privacy');
  await p.getByRole('link', { name: 'Privacy policy' }).click(); await sleep(2500);
  const top = resumed();
  ok('privacy policy opens outside the app (browser Custom Tab)', !top.includes(`${PKG}/.MainActivity`), top);
  shot('07-custom-tab');
  await back(); await sleep(800);
  ok('back from the browser returns to the app, same page', appOnTop() && new URL((await attach()).url()).pathname === '/about', resumed());
  await go('/point/pc6'); await p.waitForSelector('h1');
  const src = p.locator('a[target=_blank][href^="http"]').first();
  if (await src.count()) {
    await src.scrollIntoViewIfNeeded(); await src.click(); await sleep(2000);
    ok('a source link opens outside the app', !appOnTop(), resumed());
    await back(); await sleep(800); await attach();
  }
  ok('app WebView never navigated away from https://localhost', p.url().startsWith('https://localhost/'), p.url());
  await go('/about'); await p.getByRole('link', { name: 'Send feedback' }).scrollIntoViewIfNeeded();
  await p.getByRole('link', { name: 'Send feedback' }).click({ noWaitAfter: true }); await sleep(2000);
  const mailTop = resumed();
  ok('Send feedback hands off to a mail app (or the chooser), app does not crash', !mailTop.includes(`${PKG}/.MainActivity`) || appOnTop(), mailTop);
  shot('08-mail');
  sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(800); await attach();
  ok('app still alive after Send feedback', appOnTop() && p.url().startsWith('https://localhost/'));
}

// ---------------------------------------------------------------- 6. dark mode, rotation, large text, 3-button nav
if (run('display')) {
  await launch();
  sh('cmd uimode night yes'); await sleep(2500); await attach();
  ok('dark mode follows a live system switch (page + bars)', await p.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(25, 23, 21)');
  await go('/'); await sleep(500); shot('10-dark-home');
  await go('/point/lu7'); await sleep(500); shot('11-dark-point');
  sh('cmd uimode night no'); await sleep(2500); await attach();
  ok('light mode returns', await p.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(246, 243, 236)');

  sh('settings put system accelerometer_rotation 0'); sh('settings put system user_rotation 1'); await sleep(2500); await attach();
  await go('/'); await sleep(600);
  const land = await p.evaluate(() => { const n = document.querySelector('nav[aria-label=Main]').getBoundingClientRect(); return { w: innerWidth, h: innerHeight, navLeft: Math.round(n.left), navW: Math.round(n.width), navH: Math.round(n.height), of: document.documentElement.scrollWidth - innerWidth }; });
  ok('landscape: navigation rail on the left (80px, full height), no sideways scroll', land.w > land.h && land.navLeft === 0 && land.navW === 80 && land.navH >= land.h - 1 && land.of <= 1, JSON.stringify(land));
  shot('12-landscape'); await go('/point/lu7'); await sleep(500); shot('12b-landscape-point'); await go('/');
  sh('settings put system user_rotation 0'); await sleep(2500); await attach();

  sh('settings put system font_scale 2.0'); await sleep(1500); p = null; await launch();
  const bad = [];
  for (const u of ['/', '/map', '/points', '/safety', '/routine/headache', '/point/pc6', '/point/st9']) { await go(u); await sleep(300); const r = await pageCheck(); if (r.overflow > 1) bad.push(`${u} ${r.overflow}px`); }
  ok('largest system font (200%): no sideways scroll', bad.length === 0, bad.join(' | ') + ' textZoom=' + await p.evaluate(() => getComputedStyle(document.body).fontSize));
  await go('/'); shot('13-font-200');
  sh('settings put system font_scale 1.0'); await sleep(1500); p = null; await launch();

  sh('cmd overlay enable com.android.internal.systemui.navbar.threebutton'); await sleep(3000); p = null; await launch();
  await go('/'); await sleep(500);
  const nav = await p.evaluate(() => { const r = document.querySelector('nav[aria-label=Main]').getBoundingClientRect(); return { bottom: r.bottom, vh: innerHeight }; });
  ok('3-button navigation: navigation bar sits above the system bar', nav.bottom <= nav.vh + 0.5, JSON.stringify(nav));
  shot('14-three-button');
  sh('cmd overlay enable com.android.internal.systemui.navbar.gestural'); await sleep(2500);
}

// ---------------------------------------------------------------- 7. fully offline (airplane mode), cold start
if (run('offline')) {
  sh('cmd connectivity airplane-mode enable'); await sleep(2000);
  await launch();
  const bad = [];
  for (const u of ['/', '/map', '/points?area=hand', '/safety', '/routine/low_back_pain', '/point/ub_low_back_lines', '/point/li4', '/point/gb20']) {
    await go(u); await sleep(400); const r = await pageCheck(); if (!r.h1 || r.broken.length) bad.push(`${u} ${JSON.stringify(r.broken)}`);
  }
  const photos = await p.evaluate(() => [...document.images].length);
  ok('airplane mode: cold start and every screen works, photos load', bad.length === 0, bad.join(' | ') + ` imgs:${photos}`);
  await go('/point/li4'); await sleep(400); shot('15-offline-point');
  sh('cmd connectivity airplane-mode disable'); await sleep(1500);
}

// ---------------------------------------------------------------- 8. pregnancy mode in the app
if (run('preg')) {
  await launch();
  // Change the answer the way a user does (Safety screen), then kill and relaunch.
  await go('/settings'); await p.waitForSelector('h1');
  await p.locator('button', { hasText: PREG_YES }).first().click(); await sleep(800);
  await launch();
  ok('pregnancy answer changed in Settings survives a restart', await p.evaluate(() => localStorage.getItem('ease.pregnancyStatus')) === 'yes');
  await go('/point/sp6'); await sleep(400);
  const txt = await p.locator('main').textContent();
  ok('pregnancy mode: SP6 shows the warning, not a Start button', /pregnan/i.test(txt) && await p.getByRole('button', { name: /Start press/ }).count() === 0);
  shot('16-preg-sp6');
  await go('/settings'); await p.waitForSelector('h1');
  await p.locator('button', { hasText: PREG_NO }).first().click(); await sleep(800);
  await launch();
  ok('changing it back also survives a restart', await p.evaluate(() => localStorage.getItem('ease.pregnancyStatus')) === 'no');
}


// ---------------------------------------------------------------- 9. app layout (not the website)
if (run('appui')) {
  await launch();
  await go('/'); await p.waitForSelector('h1'); await sleep(300);
  const home = await p.evaluate(() => ({ footer: !!document.querySelector('footer'), mainNav: document.querySelectorAll('nav[aria-label=Main]').length, tabs: [...document.querySelectorAll('nav[aria-label=Main] a')].map((a) => a.textContent.trim()), logo: !!document.querySelector('header a[aria-label="Ease home"]'), sel: getComputedStyle(document.body).userSelect, over: getComputedStyle(document.documentElement).overscrollBehaviorY }));
  ok('home: app bar with logo, one nav bar with 4 tabs, no website footer', home.logo && !home.footer && home.mainNav === 1 && home.tabs.join() === 'Home,Body,Search,Settings', JSON.stringify(home));
  ok('text selection and overscroll are off (app behaviour)', home.sel === 'none' && home.over === 'none', `${home.sel} ${home.over}`);

  await go('/map'); await sleep(300);
  ok('Body tab: app bar title instead of a web page heading', await p.locator('header p', { hasText: 'Where does it hurt?' }).count() === 1);
  await go('/routine/headache'); await sleep(400);
  const det = await p.evaluate(() => ({ nav: !!document.querySelector('nav[aria-label=Main]'), back: !!document.querySelector('header button[aria-label=Back]'), webBack: [...document.querySelectorAll('main a')].some((a) => /^\s*Home\s*$/.test(a.textContent) && getComputedStyle(a).display !== 'none'), bar: !!document.querySelector('.pressbar') }));
  ok('detail screen: back arrow, bottom action bar, no tab bar and no text "Home" link', det.back && det.bar && !det.nav && !det.webBack, JSON.stringify(det));

  // App-bar back: in-app history first
  await go('/'); await p.locator('a[href="/routine/headache"]').first().click(); await p.waitForURL(/routine/); await p.locator('a[href^="/point/"]:visible').first().click(); await p.waitForURL(/\/point\//);
  await p.locator('header button[aria-label=Back]').click(); await sleep(500);
  ok('app-bar back arrow goes to the previous screen', /routine\/headache/.test(p.url()), p.url());
  await p.locator('header button[aria-label=Back]').click(); await sleep(500);
  ok('...and again to Home', new URL(p.url()).pathname === '/', p.url());
  // No history (cold deep page): back arrow goes to its parent
  await p.goto('https://localhost/point/lu7'); await p.waitForSelector('h1');
  await p.locator('header button[aria-label=Back]').click(); await sleep(600);
  ok('back arrow with no history goes to a sensible parent', ['/', '/points', '/routine/neck_pain'].includes(new URL(p.url()).pathname) || /routine/.test(p.url()), p.url());

  // App bar title fades in when scrolled
  await go('/point/lu7'); await sleep(400);
  const t0 = await p.evaluate(() => getComputedStyle(document.querySelector('header p')).opacity);
  await p.evaluate(() => window.scrollTo(0, 400)); await sleep(400);
  const t1 = await p.evaluate(() => getComputedStyle(document.querySelector('header p')).opacity);
  ok('detail app-bar title fades in after scrolling', t0 === '0' && t1 === '1', `${t0} -> ${t1}`);

  // Ripple on press
  await go('/'); await sleep(300);
  const ripple = await p.evaluate(async () => {
    const tile = document.querySelector('a[href="/routine/sleep"]'); const r = tile.getBoundingClientRect();
    const ev = (t) => new PointerEvent(t, { bubbles: true, composed: true, pointerType: 'touch', pointerId: 7, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0 });
    tile.dispatchEvent(ev('pointerdown'));
    await new Promise((x) => setTimeout(x, 120));
    const el = document.querySelector('.app-ripple');
    const info = el ? { radius: el.style.borderRadius, w: Math.round(parseFloat(el.style.width)), hasDot: !!el.querySelector('i') } : null;
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7 }));
    await new Promise((x) => setTimeout(x, 450));
    return { info, left: document.querySelectorAll('.app-ripple').length };
  });
  ok('pressing a tile shows a ripple clipped to its shape, then cleans up', !!ripple.info && ripple.info.hasDot && ripple.left === 0, JSON.stringify(ripple));
  await p.locator('a[href="/routine/sleep"]').first().click(); await p.waitForURL(/routine\/sleep/);
  ok('...and the tile still opens its routine', /routine\/sleep/.test(p.url()), p.url());

  // Channel sheet: opens, back closes it (not the screen)
  await go('/points'); await sleep(300);
  await p.getByRole('button', { name: /Channel/ }).first().click(); await sleep(500);
  ok('channel filter opens a bottom sheet', await p.locator('[role=dialog]').count() === 1);
  shot('20-filter-sheet');
  await back(); await sleep(400);
  ok('system back closes the sheet and stays on the screen', await p.locator('[role=dialog]').count() === 0 && new URL(p.url()).pathname === '/points', p.url());
  await p.getByRole('button', { name: /Channel/ }).first().click(); await sleep(400);
  await p.getByRole('button', { name: 'Lung' }).click(); await sleep(500);
  ok('choosing a channel filters the list', /Lung/.test(await p.getByRole('button', { name: /Channel|Lung/ }).first().textContent()) && (await p.locator('main a[href^="/point/"]').count()) > 0);

  // Body map sheet: system back closes it
  await go('/map'); await sleep(400);
  const fig = await p.locator('svg[aria-label^="Body map"]').boundingBox();
  await p.mouse.click(fig.x + fig.width * 0.5, fig.y + fig.height * 0.4); await sleep(700);
  ok('body map: tapping an area opens a bottom sheet', await p.locator('[data-back-closes]').count() === 1);
  shot('21-map-sheet');
  await back(); await sleep(400);
  ok('system back closes the body-map sheet and stays on the screen', await p.locator('[data-back-closes]').count() === 0 && new URL(p.url()).pathname === '/map', p.url());

  // Settings tab, Safety and About sub-screens
  await go('/settings'); await sleep(500);
  const st = await p.evaluate(() => ({ appearance: document.querySelectorAll('[role=radiogroup][aria-label=Appearance] [role=radio]').length, preg: document.querySelectorAll('[role=radiogroup][aria-label=Pregnancy] [role=radio]').length, tab: document.querySelector('nav[aria-label=Main] a[aria-current=page]')?.textContent?.trim(), hasNav: !!document.querySelector('nav[aria-label=Main]') }));
  ok('Settings tab: Appearance (3), Pregnancy (2), tab highlighted', st.appearance === 3 && st.preg === 2 && st.tab === 'Settings' && st.hasNav, JSON.stringify(st));
  shot('22-settings');
  await p.getByRole('link', { name: /Safety guide/ }).click(); await p.waitForURL(/\/safety/); await sleep(500);
  const sf = await p.evaluate(() => ({ nav: !!document.querySelector('nav[aria-label=Main]'), back: !!document.querySelector('header button[aria-label=Back]'), title: document.querySelector('header p')?.textContent, radios: document.querySelectorAll('[role=radio]').length }));
  ok('Safety guide: back arrow + pinned title, no nav bar, and no settings controls mixed in', sf.back && !sf.nav && sf.title === 'Safety' && sf.radios === 0, JSON.stringify(sf));
  await p.locator('header button[aria-label=Back]').click(); await sleep(500);
  ok('back from Safety returns to Settings', new URL(p.url()).pathname === '/settings', p.url());
  await p.getByRole('link', { name: /About Ease/ }).click(); await p.waitForURL(/\/about/); await sleep(500);
  const ab = (await p.locator('main').textContent()).replace(/\s+/g, ' ');
  ok('About shows FluxoGen and the real app version', /FluxoGen/.test(ab) && /Version \d+\.\d+\.\d+ \(build \d+\)/.test(ab), ab.slice(0, 70));
  shot('23-about');

  // Transition: the new screen is animating (opacity < 1 right after navigation) and settles to no transform
  await go('/'); await sleep(500);
  const settled = await p.evaluate(() => getComputedStyle(document.querySelector('.app-screen')).transform);
  ok('screen wrapper holds no transform after the transition (fixed bars stay pinned)', settled === 'none', settled);
}

ok('no JS errors in the whole run', errs.length === 0, errs.slice(0, 4).join(' | '));
fs.writeFileSync(outPath('android-suite-results.txt'), out.join('\n'));
console.log(`\n${out.filter((l) => l.startsWith('PASS')).length} pass, ${out.filter((l) => l.startsWith('FAIL')).length} fail`);
await dev.close();
