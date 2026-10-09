import { useLayoutEffect, useRef } from 'react';
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
  /** 'stop' draws a rose crossed marker: this spot is shown for reference, not for pressing. */
  tone?: 'press' | 'stop';
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

export default function AtlasDiagram({ view, marks, className, compact, full, labels, tone = 'press' }: AtlasDiagramProps) {
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
  const ref = useRef<SVGSVGElement>(null);
  // A label cut by the crop edge reads as a bug; hide any landmark label that isn't fully inside.
  useLayoutEffect(() => {
    if (full || !ref.current) return;
    for (const el of ref.current.querySelectorAll<SVGTextElement>('text[data-lm]')) {
      const b = el.getBBox();
      el.style.visibility = b.x < vx + 2 || b.y < vy + 2 || b.x + b.width > vx + vw - 2 || b.y + b.height > vy + vh - 2 ? 'hidden' : 'visible';
    }
  });
  return (
    <svg
      ref={ref}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      className={`${className ?? ''} ${compact ? '[&_text]:hidden' : ''}`}
      role="img"
      aria-label={g.label}
    >
      <Art />
      {all.map(([x, y], i) => (
        <g key={i}>
          {tone === 'stop' && !labels ? (
            <>
              <circle cx={x} cy={y} r={r * 1.9} fill="var(--stop)" fillOpacity={0.16} />
              <circle cx={x} cy={y} r={r * 1.15} fill="var(--atlas-paper)" stroke="var(--stop)" strokeWidth={r * 0.32} />
              <path d={`M${x - r * 0.55} ${y - r * 0.55} L${x + r * 0.55} ${y + r * 0.55} M${x + r * 0.55} ${y - r * 0.55} L${x - r * 0.55} ${y + r * 0.55}`} stroke="var(--stop)" strokeWidth={r * 0.32} strokeLinecap="round" />
            </>
          ) : (
            <>
              {!labels && <circle cx={x} cy={y} r={r * (marks.length > 2 ? 1.1 : 1.9)} fill="var(--accent)" fillOpacity={0.28} />}
              <circle cx={x} cy={y} r={labels ? 3.2 : marks.length > 2 ? r * 0.6 : r} fill="var(--accent)" stroke="var(--atlas-paper)" strokeWidth={labels ? 1 : r * 0.3} />
            </>
          )}
          {labels && (
            <text x={x + 5} y={y + 3} fontSize={9} fontWeight={700} fill="var(--accent-strong)" fontFamily="inherit">
              {labels[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
