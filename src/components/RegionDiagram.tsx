import { REGION_VIEWS } from './regions/art';
import { POINT_DIAGRAMS } from '../data/pointDiagrams';

interface RegionDiagramProps {
  pointId: string;
  className?: string;
  /** Thumbnail mode: tighter crop, no sibling dots or labels. */
  compact?: boolean;
  /** Draw the whole view instead of a crop (gallery/debug). */
  full?: boolean;
  /** Also draw neighbouring points as hollow labelled dots. Off by default: one point per picture. */
  showNearby?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Marks for the selected point (mirrored across a body-centred view's midline). */
function marksFor(id: string, mirrorX?: number): Array<[number, number]> {
  const spec = POINT_DIAGRAMS[id];
  if (!spec) return [];
  if (spec.marks) return spec.marks;
  const base: Array<[number, number]> = [[spec.x, spec.y]];
  if (mirrorX !== undefined && Math.abs(spec.x - mirrorX) > 2) base.push([2 * mirrorX - spec.x, spec.y]);
  return base;
}

export function hasRegionDiagram(pointId: string): boolean {
  return pointId in POINT_DIAGRAMS;
}

export function regionLabel(pointId: string): string | undefined {
  const spec = POINT_DIAGRAMS[pointId];
  return spec ? REGION_VIEWS[spec.view].label : undefined;
}

// Original illustration of the body area around a point, with the point marked and
// nearby points shown faintly. Illustration, not a photo — positions are approximate.
export default function RegionDiagram({ pointId, className, compact, full, showNearby }: RegionDiagramProps) {
  const spec = POINT_DIAGRAMS[pointId];
  if (!spec) return null;
  const view = REGION_VIEWS[spec.view];
  const [W, H] = view.size;
  const [ww, wh] = compact ? [view.win[0] * 0.7, view.win[1] * 0.7] : view.win;

  const marks = marksFor(pointId, view.mirrorX);
  const cx = marks.reduce((s, m) => s + m[0], 0) / marks.length;
  const cy = marks.reduce((s, m) => s + m[1], 0) / marks.length;
  // Series (EX-B2) and mirrored pairs: centre on the first mark so the crop stays tight.
  const [fx, fy] = marks.length > 2 || (view.mirrorX !== undefined && marks.length === 2 && !compact) ? [cx, cy] : marks[0];
  const cxView = view.pullX ? fx * (1 - view.pullX[1]) + view.pullX[0] * view.pullX[1] : fx;
  const vx = full ? 0 : clamp(cxView - ww / 2, 0, W - ww);
  const vy = full ? 0 : clamp(fy - wh / 2, 0, H - wh);
  const vw = full ? W : ww;
  const vh = full ? H : wh;
  const r = (full ? W : ww) * 0.03;

  const siblings = Object.entries(POINT_DIAGRAMS).filter(
    ([id, s]) => id !== pointId && s.view === spec.view && !s.marks,
  );

  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className={`${className ?? ''} ${compact ? '[&_text]:hidden' : ''}`} role="img" aria-label={`Illustration of where ${pointId.toUpperCase()} is`}>
      {view.Art()}
      {showNearby && !compact &&
        siblings.flatMap(([id, s]) =>
          [[s.x, s.y] as [number, number]]
            .concat(view.mirrorX !== undefined && Math.abs(s.x - view.mirrorX) > 2 ? [[2 * view.mirrorX - s.x, s.y]] : [])
            .filter(([x, y]) => x >= vx - r && x <= vx + vw + r && y >= vy - r && y <= vy + vh + r)
            .map(([x, y], i) => {
              const toLeft = view.mirrorX !== undefined ? x < view.mirrorX - 2 : x > vx + vw * 0.72;
              return (
                <g key={`${id}-${i}`}>
                  <circle cx={x} cy={y} r={r * 0.6} fill="#fff" stroke="#8A4A30" strokeOpacity={0.55} strokeWidth={1.2} />
                  <text
                    x={toLeft ? x - r * 1.0 : x + r * 1.0}
                    y={y + r * 0.5}
                    textAnchor={toLeft ? 'end' : 'start'}
                    fontSize={r * 1.45}
                    fill="#8A4A30"
                    fillOpacity={0.7}
                    fontFamily="Manrope, sans-serif"
                    fontWeight={700}
                  >
                    {id.toUpperCase().replace('_', '-')}
                  </text>
                </g>
              );
            }),
        )}
      {marks.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r * (marks.length > 2 ? 1.1 : 1.9)} fill="#C8734F" fillOpacity={0.25} />
          <circle cx={x} cy={y} r={marks.length > 2 ? r * 0.6 : r} fill="#C8734F" stroke="#fff" strokeWidth={r * 0.3} />
        </g>
      ))}
    </svg>
  );
}
