// WCAG contrast check for the design tokens in src/index.css (light + dark). Exit 1 on failure.
import fs from 'fs';
const css = fs.readFileSync('src/index.css', 'utf8');
const blocks = [...css.matchAll(/:root\s*\{([\s\S]*?)\n\s*\}/g)].map((m) => m[1]);
const parse = (b) => Object.fromEntries([...b.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6}|rgb\([^)]*\))\s*;/g)].map((m) => [m[1], m[2]]));
const light = parse(blocks[0]);
const dark = { ...light, ...parse(blocks[1]) };
const hex = (c) => {
  if (c.startsWith('#')) return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const n = c.match(/[\d.]+/g).map(Number); return n.slice(0, 3);
};
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// [foreground, background, min ratio, note]
const PAIRS = [
  ['ink', 'paper', 4.5], ['ink', 'card', 4.5], ['ink', 'card-2', 4.5],
  ['ink-2', 'paper', 4.5], ['ink-2', 'card', 4.5], ['ink-2', 'card-2', 4.5],
  ['ink-3', 'card', 3, 'decorative / placeholder only'],
  ['accent-strong', 'paper', 4.5], ['accent-strong', 'card', 4.5], ['accent-strong', 'accent-tint', 4.5],
  ['on-accent', 'accent-strong', 4.5],
  ['ok', 'ok-tint', 4.5], ['ok', 'card', 4.5], ['info', 'info-tint', 4.5], ['info', 'card', 4.5],
  ['caution', 'caution-tint', 4.5], ['stop', 'stop-tint', 4.5], ['stop', 'card', 4.5],
  ['accent', 'card', 3, 'graphics only (dots, rings)'],
  ['atlas-label', 'atlas-paper', 4.5],
];
let fail = 0;
for (const [name, theme] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min, note] of PAIRS) {
    const r = ratio(theme[fg], theme[bg]);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(5)} ${fg.padEnd(14)} on ${bg.padEnd(11)} ${r.toFixed(2)} (min ${min})${note ? ' — ' + note : ''}`);
  }
}
console.log(fail ? `${fail} pair(s) below target` : 'all pairs pass');
process.exit(fail ? 1 : 0);
