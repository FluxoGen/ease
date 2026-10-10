// Google Play store assets, made from the real app. Output goes to <repo>/store/.
//   node store-assets.mjs phone     phone screenshots    -> store/screenshots          (emulator screen 1080x1920)
//   node store-assets.mjs tablet    tablet screenshots   -> store/screenshots-tablet   (emulator screen 2560x1440, 16:9)
//   node store-assets.mjs desktop   Chromebook/desktop   -> store/screenshots-desktop  (emulator screen 1920x1080, 16:9)
//   node store-assets.mjs graphics  the 512 px icon and the 1024x500 feature graphic (from the phone screenshots)
// Screenshots need a booted emulator at the right screen size with the debug APK installed: qa/android/store.sh does it all.
import { _android as android, chromium } from 'playwright';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ADB, PKG } from '../lib/android.mjs';
import { ROOT } from '../lib/env.mjs';

const STORE = path.join(ROOT, 'store');
const KIND = process.argv[2] ?? 'phone';
const SHOTS = path.join(STORE, KIND === 'tablet' ? 'screenshots-tablet' : KIND === 'desktop' ? 'screenshots-desktop' : 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const sh = (c) => execSync(`${ADB} shell ${JSON.stringify(c)}`, { encoding: 'utf8', maxBuffer: 64 << 20 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function screenshots() {
  const [dev] = await android.devices();
  sh('settings put system accelerometer_rotation 0'); sh('settings put system user_rotation 0'); sh('cmd uimode night no');
  sh(`pm clear ${PKG}`); sh(`am start -W -n ${PKG}/.MainActivity`); await sleep(2000);
  const pid = sh(`pidof ${PKG}`).trim();
  const p = await (await dev.webView({ socketName: 'webview_devtools_remote_' + pid })).page(); await p.waitForSelector('#root > *');
  await p.evaluate(() => { localStorage.setItem('ease.pregnancyStatus', 'no'); localStorage.setItem('ease.theme', 'light'); });
  await p.reload(); await p.waitForSelector('#root > *'); await sleep(900); // reload so the saved answer is what the app starts with
  const go = async (u) => { await p.evaluate((x) => { history.pushState({}, '', x); dispatchEvent(new PopStateEvent('popstate')); }, u); await sleep(1200); };
  const shot = (name) => fs.writeFileSync(path.join(SHOTS, name), execSync(`${ADB} exec-out screencap -p`, { maxBuffer: 64 << 20 }));
  const theme = async (t) => { await p.evaluate((v) => { localStorage.setItem('ease.theme', v); }, t); await p.reload(); await p.waitForSelector('#root > *'); await sleep(900); };

  await go('/'); shot('01-home.png');
  await go('/routine/headache'); shot('02-routine.png');
  await go('/point/lu7'); shot('03-point-photo.png');
  await go('/point/cv13'); shot('04-point-drawing.png');
  await go('/map');
  const fig = await p.locator('svg[aria-label^="Body map"]').boundingBox();
  await p.mouse.click(fig.x + fig.width * 0.5, fig.y + fig.height * 0.4); await sleep(900); shot('05-body-map.png');
  await go('/point/li4'); await p.getByRole('button', { name: /Start press/ }).last().click(); await sleep(700);
  await p.getByRole('button', { name: 'Start', exact: true }).click(); await sleep(9000); shot('06-guided-press.png');
  await p.keyboard.press('Escape'); await sleep(500);
  await go('/points'); shot('07-all-points.png');
  await theme('dark'); await go('/routine/sleep'); shot('08-dark-routine.png');
  await theme('light');
  await dev.close();
}

async function graphics() {
  const manrope = path.join(ROOT, 'node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2');
  const logo = fs.readFileSync(path.join(ROOT, 'src/components/EaseLogo.tsx'), 'utf8');
  const d = logo.match(/<path\s+fill=\{ink\}\s+d="([^"]+)"/)[1];
  const wordmark = (ink, dot) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 6.72 327.37 98.88"><path fill="${ink}" d="${d}"/><circle cx="165.34" cy="65.12" r="26" fill="none" stroke="${ink}" stroke-width="1.5" opacity=".25"/><circle cx="165.34" cy="65.12" r="17" fill="none" stroke="${ink}" stroke-width="2" opacity=".5"/><circle cx="165.34" cy="65.12" r="8" fill="${dot}"/></svg>`;
  const b = await chromium.launch();

  // 512 x 512 icon: the app's ring + dot on paper, full-bleed square (Play applies its own mask).
  {
    const p = await b.newPage({ viewport: { width: 512, height: 512 } });
    await p.setContent(`<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 108 108"><rect width="108" height="108" fill="#F6F3EC"/><circle cx="54" cy="54" r="24" fill="none" stroke="#22302B" stroke-width="6.4"/><circle cx="54" cy="54" r="11.4" fill="#C8734F"/></svg></body>`);
    await p.screenshot({ path: path.join(STORE, 'icon-512.png') });
    await p.close();
  }

  // 1024 x 500 feature graphic: wordmark and promise on the left, two real screens on the right.
  {
    const img = (n) => 'data:image/png;base64,' + fs.readFileSync(path.join(STORE, 'screenshots', n)).toString('base64');
    const font = 'data:font/woff2;base64,' + fs.readFileSync(manrope).toString('base64');
    const html = `<!doctype html><meta charset="utf-8"><style>
      @font-face{font-family:M;src:url(${font}) format("woff2-variations");font-weight:200 800}
      *{box-sizing:border-box;margin:0}
      body{width:1024px;height:500px;overflow:hidden;font-family:M,system-ui;color:#22302B;background:radial-gradient(900px 520px at 18% 20%,#fffdf9 0%,#f6f3ec 60%,#efe8da 100%);position:relative}
      .l{position:absolute;left:64px;top:0;height:500px;display:flex;flex-direction:column;justify-content:center;width:480px}
      .logo{width:230px}
      h1{font-size:46px;line-height:1.08;font-weight:800;letter-spacing:-.025em;margin-top:30px}
      h1 span{color:#8a4a30}
      p{margin-top:16px;font-size:20px;line-height:1.4;color:#566059;font-weight:500}
      .chips{display:flex;gap:10px;margin-top:26px}
      .chips b{font-size:15px;font-weight:700;padding:9px 16px;border-radius:999px;background:#f4e2d7;color:#8a4a30}
      .ph{position:absolute;border-radius:34px;box-shadow:0 30px 60px -18px rgba(34,48,43,.45),0 0 0 7px #22302B;overflow:hidden;background:#fff}
      .ph img{display:block;width:100%}
      .a{left:610px;top:48px;width:190px;transform:rotate(-4deg)}
      .b{left:810px;top:96px;width:190px;transform:rotate(4deg)}
    </style><body>
      <div class="l"><div class="logo">${wordmark('#22302B', '#C8734F')}</div>
        <h1>Self-acupressure, <span>guided.</span></h1>
        <p>Find the right points for everyday aches, with pictures and a calm timer.</p>
        <div class="chips"><b>412 points</b><b>23 routines</b><b>Works offline</b></div></div>
      <div class="ph a"><img src="${img('02-routine.png')}"></div>
      <div class="ph b"><img src="${img('03-point-photo.png')}"></div></body>`;
    const p = await b.newPage({ viewport: { width: 1024, height: 500 } });
    await p.setContent(html); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(STORE, 'feature-graphic-1024x500.png') });
    await p.close();
  }
  await b.close();
}

if (KIND === 'graphics') await graphics(); else await screenshots();
for (const f of fs.readdirSync(SHOTS)) console.log(`${path.basename(SHOTS)}/${f}`);
