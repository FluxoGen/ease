#!/usr/bin/env node
// Runs a group of QA scripts and prints one verdict per script.
//   node run.mjs web|app|android|all [name ...]      e.g.  node run.mjs web flows press
// Exit code 1 if anything failed or produced no verdict.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEV, WEB } from './lib/env.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

const GROUPS = {
  web: { needs: { url: WEB, how: 'npm run build && npm run preview' }, scripts: [
    ['flows', 'web/flows.mjs'], ['audit', 'web/audit.mjs'], ['responsive', 'web/responsive.mjs'], ['press', 'web/press.mjs'], ['update', 'web/update.mjs'],
  ] },
  app: { needs: { url: DEV, how: 'npm run dev' }, scripts: [
    ['audit', 'app/audit.mjs'], ['responsive', 'app/responsive.mjs'], ['theme', 'app/theme.mjs'], ['update', 'app/update.mjs'],
  ] },
  android: { needs: null, scripts: [
    ['suite', 'android/suite.mjs'], ['theme', 'android/theme.mjs'], ['coldload', 'android/cold-load.mjs'], ['sizes', 'android/sizes.sh'],
  ] },
};

/** A script passes when it shows positive evidence and nothing negative. */
function verdict(out, code) {
  if (code !== 0) return 'exit code ' + code;
  if (/^FAIL/m.test(out)) return 'FAIL lines: ' + (out.match(/^FAIL.*$/m) ?? [''])[0].slice(0, 110);
  if (/FINDINGS [1-9]/.test(out)) return (out.match(/FINDINGS \d+/) ?? [''])[0];
  if (/^total [1-9]/m.test(out)) return 'issues reported (' + (out.match(/^total \d+/m) ?? [''])[0] + ')';
  if (/\b[1-9]\d* fail\b/.test(out)) return (out.match(/\d+ pass, \d+ fail/) ?? [''])[0];
  if (/Error:|ECONNREFUSED|ECONNRESET/.test(out)) return 'script error: ' + (out.match(/(Error:|ECONN\w+).*/) ?? [''])[0].slice(0, 100);
  const evidence = /^PASS/m.test(out) || /FINDINGS 0/.test(out) || /^total 0/m.test(out) || /no issues/.test(out);
  return evidence ? null : 'no result printed';
}

const run = (file) => new Promise((resolve) => {
  const cmd = file.endsWith('.sh') ? 'bash' : process.execPath;
  const p = spawn(cmd, [path.join(here, file)], { cwd: path.join(here, path.dirname(file)), env: process.env });
  let out = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { out += d; });
  p.on('close', (code) => resolve({ out, code }));
});

const reachable = async (url) => { try { await fetch(url, { signal: AbortSignal.timeout(4000) }); return true; } catch { return false; } };

const [which = 'all', ...only] = process.argv.slice(2);
const groups = which === 'all' ? Object.keys(GROUPS) : [which];
if (groups.some((g) => !GROUPS[g])) { console.error(`Usage: node run.mjs ${Object.keys(GROUPS).join('|')}|all [script ...]`); process.exit(2); }

let failed = 0;
for (const g of groups) {
  const { needs, scripts } = GROUPS[g];
  console.log(`\n== ${g}`);
  if (needs && !(await reachable(needs.url))) { console.log(`   not running at ${needs.url}. Start it first: ${needs.how}`); failed++; continue; }
  for (const [name, file] of scripts) {
    if (only.length && !only.includes(name)) continue;
    const t0 = Date.now();
    const { out, code } = await run(file);
    const problem = verdict(out, code);
    const secs = Math.round((Date.now() - t0) / 1000);
    console.log(`   ${problem ? 'FAIL' : 'ok  '}  ${g}/${name}  (${secs}s)${problem ? '  ' + problem : ''}`);
    if (problem) { failed++; console.log(out.split('\n').filter((l) => /FAIL|FINDINGS|issue|^\S+ \S+: /.test(l)).slice(0, 12).map((l) => '        ' + l.slice(0, 170)).join('\n')); }
  }
}
console.log(failed ? `\n${failed} problem(s).` : '\nAll QA passed.');
process.exit(failed ? 1 : 0);
