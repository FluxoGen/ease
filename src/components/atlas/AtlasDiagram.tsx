import { VIEWS, type ViewId, type XY } from './geometry';
import { VIEW_ART } from './views';

interface AtlasDiagramProps {
  view: ViewId;
  /** The point's position(s). Bilateral points on body-centred views are mirrored automatically. */
  marks: XY[];
  className?: string;
  /** Thumbnail: tighter crop, labels hidden. */
  compact?: boolean;
  /** Draw the whole view (debug / sweep). */
  full?: boolean;
  /** Debug only: label each mark. */
  labels?: string[];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

export default function AtlasDiagram({ view, marks, className, compact, full, labels }: AtlasDiagramProps) {
  const g = VIEWS[view];
  const [W, H] = g.size;
  const all: XY[] = [...marks];
  if (g.mirrorX !== undefined && !labels) {
    for (const [x, y] of marks) if (Math.abs(x - g.mirrorX) > 2) all.push([2 * g.mirrorX - x, y]);
  }
  const [ww, wh] = compact ? [g.win[0] * 0.72, g.win[1] * 0.72] : g.win;
  // Centre on the first mark; a series (e.g. a line of points) centres on its middle.
  const focus = marks.length > 2 ? marks[Math.floor(marks.length / 2)] : marks[0];
  const vx = full ? 0 : clamp(focus[0] - ww / 2, 0, W - ww);
  const vy = full ? 0 : clamp(focus[1] - wh / 2, 0, H - wh);
  const vw = full ? W : ww;
  const vh = full ? H : wh;
  const r = Math.max(4, (full ? Math.min(W, 300) : ww) * (marks.length > 2 ? 0.018 : 0.03));
  const Art = VIEW_ART[view];
  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      className={`${className ?? ''} ${compact ? '[&_text]:hidden' : ''}`}
      role="img"
      aria-label={g.label}
    >
      <Art />
      {all.map(([x, y], i) => (
        <g key={i}>
          {!labels && <circle cx={x} cy={y} r={r * 1.9} fill="#C8734F" fillOpacity={0.25} />}
          <circle cx={x} cy={y} r={labels ? 3.2 : r} fill="#C8734F" stroke="#fff" strokeWidth={labels ? 1 : r * 0.3} />
          {labels && (
            <text x={x + 5} y={y + 3} fontSize={9} fontWeight={700} fill="#7a2e12" fontFamily="Manrope, sans-serif">
              {labels[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
