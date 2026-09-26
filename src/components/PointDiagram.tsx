import { BodyOutlinePaths } from './BodySilhouette';

interface PointDiagramProps {
  x: number;
  y: number;
  className?: string;
}

// Used instead of a photo for points that don't have one (verified: false —
// no fabricated stock photo pretending to be real). A zoomed-in crop of our
// own body silhouette, centered on the point, with a dot marking it.
export default function PointDiagram({ x, y, className }: PointDiagramProps) {
  const half = 65;
  return (
    <svg
      viewBox={`${x - half} ${y - half} ${half * 2} ${half * 2}`}
      className={className}
      aria-hidden="true"
    >
      <g className="text-charcoal/50 dark:text-ivory/40">
        <BodyOutlinePaths />
      </g>
      <circle cx={x} cy={y} r={7} className="fill-clay stroke-white dark:stroke-charcoal-soft" strokeWidth={2} />
    </svg>
  );
}
