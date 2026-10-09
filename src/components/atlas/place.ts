import { VIEWS, type ViewGeometry, type ViewId, type XY } from './geometry';

/** Placement spec, as written in docs/library-pipeline.md. Distances are in cun. */
export type Place =
  | { at: string }
  | { from: string; up?: number; down?: number; out?: number; in?: number }
  | { line: string; from: string; cun: number }
  | { between: [string, string]; frac: number }
  | { manual: string };

/** Pixels per cun vertically at a given y (from the view's bands). */
function vScale(g: ViewGeometry, y: number): number {
  for (const [a, b, cun] of g.bands) if (y >= Math.min(a, b) && y <= Math.max(a, b)) return Math.abs(b - a) / cun;
  return g.cunPx;
}

function landmark(g: ViewGeometry, id: string): XY {
  const p = g.landmarks[id];
  if (!p) throw new Error(`unknown landmark ${id}`);
  return p;
}

/** Nearest point on a polyline, as [segment index, t, point]. */
function project(line: XY[], p: XY): [number, number, XY] {
  let best: [number, number, XY] = [0, 0, line[0]];
  let bestD = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i];
    const [bx, by] = line[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / len2));
    const q: XY = [ax + t * dx, ay + t * dy];
    const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
    if (d < bestD) { bestD = d; best = [i, t, q]; }
  }
  return best;
}

/** Walk `cun` along a polyline from the projection of `start`. Lines are ordered from the
 * trunk/head end outward, so positive cun walks toward index 0. */
function walk(g: ViewGeometry, line: XY[], start: XY, cun: number): XY {
  let [i, t, p] = project(line, start);
  let remaining = Math.abs(cun);
  const toward0 = cun > 0;
  const STEP = 0.5;
  for (let guard = 0; remaining > 0 && guard < 20000; guard++) {
    const target = toward0 ? line[i] : line[i + 1];
    const dx = target[0] - p[0];
    const dy = target[1] - p[1];
    const d = Math.hypot(dx, dy);
    if (d < STEP) {
      if (toward0 ? i === 0 : i + 1 === line.length - 1) { p = target; break; }
      p = target;
      i = toward0 ? i - 1 : i + 1;
      t = toward0 ? 1 : 0;
      continue;
    }
    // A mostly-horizontal step uses the sideways scale; otherwise the local vertical band.
    const s = Math.abs(dy) > Math.abs(dx) ? vScale(g, p[1]) : g.cunPx;
    const stepCun = STEP / s;
    const k = Math.min(1, remaining / stepCun);
    p = [p[0] + (dx / d) * STEP * k, p[1] + (dy / d) * STEP * k];
    remaining -= stepCun * k;
  }
  void t;
  return p;
}

/** Resolve a placement spec to drawing coordinates. Returns null for `manual` (needs an override). */
export function resolvePlace(view: ViewId, spec: Place): XY | null {
  const g = VIEWS[view];
  if ('manual' in spec) return null;
  if ('at' in spec) return landmark(g, spec.at);
  if ('between' in spec) {
    const [a, b] = spec.between.map((id) => landmark(g, id));
    return [a[0] + (b[0] - a[0]) * spec.frac, a[1] + (b[1] - a[1]) * spec.frac];
  }
  if ('line' in spec) {
    const line = g.lines[spec.line];
    if (!line) throw new Error(`unknown line ${spec.line} on ${view}`);
    return walk(g, line, landmark(g, spec.from), spec.cun);
  }
  const [x0, y0] = landmark(g, spec.from);
  const vert = (spec.up ?? 0) - (spec.down ?? 0);
  const side = (spec.out ?? 0) - (spec.in ?? 0);
  // Vertical: integrate band scales from y0 so a move that crosses bands stays proportional.
  let y = y0;
  let left = Math.abs(vert);
  const dir = Math.sign(vert) * (g.upY as number);
  while (left > 0) {
    const s = vScale(g, y);
    const stepCun = Math.min(left, 0.05);
    y += dir * stepCun * s;
    left -= stepCun;
  }
  return [x0 + g.outX * side * g.cunPx, y];
}
