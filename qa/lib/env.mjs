// Shared settings for every QA script. Override with environment variables.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Production build: `npm run build && npm run preview` (the website, service worker and all). */
export const WEB = process.env.QA_WEB ?? 'http://localhost:4173';
/** Dev server: `npm run dev`. The app layout is previewed with ?app=1, which only exists in dev builds. */
export const DEV = process.env.QA_DEV ?? 'http://localhost:5183';

/** Reports and screenshots go here (git-ignored). */
export const OUT = process.env.QA_OUT ?? path.join(ROOT, 'qa', 'out');
fs.mkdirSync(OUT, { recursive: true });
export const outPath = (...parts) => {
  const p = path.join(OUT, ...parts);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  return p;
};

export const points = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/library/points.json'), 'utf8'));
export const routineIds = [...fs.readFileSync(path.join(ROOT, 'src/data/routines.ts'), 'utf8').matchAll(/\{ id: '([a-z_]+)'/g)].map((m) => m[1]);
