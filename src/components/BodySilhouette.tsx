interface BodySilhouetteProps {
  className?: string;
}

// A simple, original schematic humanoid outline (not adapted from any
// existing anatomical illustration) — just enough shape to place point
// markers on. Front and back share this same silhouette; only the dots
// overlaid on top differ per view. Points are placed against a 240x600
// viewBox (see BODY_MAP_VIEWBOX in ../data/bodyMap).
export function BodyOutlinePaths() {
  return (
    <g stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="none">
      <rect x="88" y="290" width="30" height="270" rx="15" />
      <rect x="122" y="290" width="30" height="270" rx="15" />
      <ellipse cx="98" cy="572" rx="22" ry="12" />
      <ellipse cx="142" cy="572" rx="22" ry="12" />
      <rect x="42" y="100" width="28" height="180" rx="14" />
      <rect x="170" y="100" width="28" height="180" rx="14" />
      <circle cx="56" cy="292" r="14" />
      <circle cx="184" cy="292" r="14" />
      <rect x="78" y="85" width="84" height="215" rx="38" />
      <circle cx="120" cy="40" r="32" />
    </g>
  );
}

export default function BodySilhouette({ className }: BodySilhouetteProps) {
  return (
    <svg viewBox="0 0 240 600" className={className} aria-hidden="true">
      <BodyOutlinePaths />
    </svg>
  );
}
