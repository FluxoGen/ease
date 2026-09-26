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
    <>
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
      {/* Joint landmark ticks — mostly invisible zoomed out, but give a
          zoomed-in PointDiagram crop something to orient by (otherwise
          any crop of a plain rounded-rect limb looks the same). */}
      <g stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.45">
        <line x1="38" y1="103" x2="74" y2="103" /> {/* left shoulder */}
        <line x1="166" y1="103" x2="202" y2="103" /> {/* right shoulder */}
        <line x1="38" y1="205" x2="74" y2="205" /> {/* left elbow */}
        <line x1="166" y1="205" x2="202" y2="205" /> {/* right elbow */}
        <line x1="38" y1="272" x2="74" y2="272" /> {/* left wrist */}
        <line x1="166" y1="272" x2="202" y2="272" /> {/* right wrist */}
        <line x1="84" y1="293" x2="162" y2="293" /> {/* hips */}
        <line x1="84" y1="410" x2="118" y2="410" /> {/* left knee */}
        <line x1="122" y1="410" x2="156" y2="410" /> {/* right knee */}
        <line x1="84" y1="552" x2="118" y2="552" /> {/* left ankle */}
        <line x1="122" y1="552" x2="156" y2="552" /> {/* right ankle */}
      </g>
    </>
  );
}

export default function BodySilhouette({ className }: BodySilhouetteProps) {
  return (
    <svg viewBox="0 0 240 600" className={className} aria-hidden="true">
      <BodyOutlinePaths />
    </svg>
  );
}
