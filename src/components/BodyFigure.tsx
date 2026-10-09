import type { Area } from '../data/library';
import { AREAS } from '../data/library/areas';

export type BodyView = 'front' | 'back';

interface BodyFigureProps {
  view: BodyView;
  selected?: Area | null;
  /** When set the regions are buttons. Leave out for a decorative figure. */
  onSelect?: (area: Area) => void;
  counts?: Partial<Record<Area, number>>;
  className?: string;
}

// One figure, drawn once: the right-hand side is the left mirrored. Every shape is a soft, rounded
// solid so the body reads as friendly, not clinical. Colors come from the atlas tokens.
const HEAD = (
  <>
    <ellipse cx="110" cy="42" rx="24" ry="28" />
    <path d="M99 66 L99 84 Q110 91 121 84 L121 66 Z" />
  </>
);
const TORSO = <path d="M70 92 C92 82 128 82 150 92 C160 118 154 158 152 190 C152 214 160 236 162 254 C130 270 90 270 58 254 C60 236 68 214 68 190 C66 158 60 118 70 92 Z" />;
const ARM = <path d="M66 96 C50 100 44 124 41 156 C39 190 36 218 31 242 L49 247 C56 220 62 194 67 162 C70 136 72 116 75 100 Z" />;
const HAND = <ellipse cx="38" cy="263" rx="11" ry="18" transform="rotate(8 38 263)" />;
const LEG = <path d="M62 256 C60 310 68 366 75 420 L76 446 L98 446 L99 420 C104 366 108 314 108 266 Z" />;
const FOOT = <path d="M76 446 C69 452 65 462 69 468 C80 473 101 471 101 465 L98 446 Z" />;
const MIRROR = 'translate(220 0) scale(-1 1)';

function Region({
  area, label, selected, onSelect, children, hit,
}: {
  area: Area; label: string; selected: boolean; onSelect?: (a: Area) => void; children: React.ReactNode; hit?: React.ReactNode;
}) {
  const interactive = Boolean(onSelect);
  return (
    <g
      className={interactive ? 'body-region' : 'body-static'}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? label : undefined}
      aria-pressed={interactive ? selected : undefined}
      onClick={interactive ? () => onSelect!(area) : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect!(area); } } : undefined}
      style={{ cursor: interactive ? 'pointer' : undefined, outline: 'none' }}
    >
      {children}
      {hit}
    </g>
  );
}

const hitEllipse = (cx: number, cy: number, rx: number, ry: number) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="transparent" />;
const hitCircle = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r} fill="transparent" />;

export default function BodyFigure({ view, selected = null, onSelect, counts, className }: BodyFigureProps) {
  const label = (a: Area) => {
    const name = AREAS.find((x) => x.id === a)?.label ?? a;
    return counts?.[a] ? `${name}, ${counts[a]} points` : name;
  };
  const torsoArea: Area = view === 'front' ? 'chest-belly' : 'back';
  const sel = (a: Area) => selected === a;
  return (
    <svg viewBox="0 0 220 480" className={className} role={onSelect ? 'group' : 'img'} aria-label={onSelect ? 'Body map. Tap the area that hurts.' : undefined} aria-hidden={onSelect ? undefined : true}>
      <style>{`
        .body-region .part, .body-static .part { fill: var(--atlas-skin); stroke: var(--atlas-line); stroke-width: 1.6; stroke-linejoin: round; transition: fill .18s, stroke .18s; }
        .body-region:hover .part, .body-region:focus-visible .part { fill: var(--accent-tint); stroke: var(--accent); }
        .body-region[aria-pressed="true"] .part { fill: color-mix(in srgb, var(--accent) 38%, var(--atlas-skin)); stroke: var(--accent); stroke-width: 2.6; }
        .body-region, .body-region:focus, .body-region:focus-visible { outline: none; }
        .body-region:focus-visible .part { stroke: var(--accent-strong); stroke-width: 3; }
      `}</style>
      <ellipse cx="110" cy="474" rx="62" ry="5" fill="var(--ink)" opacity="0.07" />
      {/* draw order = tap priority: legs, feet, torso, head, then arms and hands on top */}
      <Region area="leg" label={label('leg')} selected={sel('leg')} onSelect={onSelect} hit={<>{hitCircle(84, 360, 44)}{hitCircle(136, 360, 44)}</>}>
        <g className="part">{LEG}</g>
        <g className="part" transform={MIRROR}>{LEG}</g>
      </Region>
      <Region area="foot" label={label('foot')} selected={sel('foot')} onSelect={onSelect} hit={<>{hitCircle(84, 460, 32)}{hitCircle(136, 460, 32)}</>}>
        <g className="part">{FOOT}</g>
        <g className="part" transform={MIRROR}>{FOOT}</g>
      </Region>
      <Region area={torsoArea} label={label(torsoArea)} selected={sel(torsoArea)} onSelect={onSelect}>
        <g className="part">{TORSO}</g>
      </Region>
      <Region area="head" label={label('head')} selected={sel('head')} onSelect={onSelect} hit={hitCircle(110, 50, 42)}>
        <g className="part">{HEAD}</g>
      </Region>
      <Region area="arm" label={label('arm')} selected={sel('arm')} onSelect={onSelect} hit={<>{hitEllipse(50, 172, 20, 78)}{hitEllipse(170, 172, 20, 78)}</>}>
        <g className="part">{ARM}</g>
        <g className="part" transform={MIRROR}>{ARM}</g>
      </Region>
      <Region area="hand" label={label('hand')} selected={sel('hand')} onSelect={onSelect} hit={<>{hitCircle(36, 266, 30)}{hitCircle(184, 266, 30)}</>}>
        <g className="part">{HAND}</g>
        <g className="part" transform={MIRROR}>{HAND}</g>
      </Region>
      {view === 'back' && (
        <path d="M86 40 C84 14 136 14 134 40 C134 30 122 22 110 22 C98 22 86 30 86 40 Z M86 40 C86 56 92 62 99 66 L99 52 C92 50 88 46 86 40 Z M134 40 C134 56 128 62 121 66 L121 52 C128 50 132 46 134 40 Z" fill="var(--atlas-hair)" stroke="var(--atlas-line)" strokeWidth="1.2" pointerEvents="none" />
      )}
      {view === 'front' && (
        <g pointerEvents="none" stroke="var(--atlas-faint)" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M104 118 Q110 124 116 118" />
          <circle cx="110" cy="204" r="2.4" fill="var(--atlas-faint)" />
        </g>
      )}
      {onSelect && !selected && (
        <g pointerEvents="none" aria-hidden="true">
          {[[110, 40], [110, 175], [52, 160], [168, 160], [38, 263], [182, 263], [84, 350], [136, 350], [84, 458], [136, 458]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="9" fill="var(--accent)" opacity="0.28" style={{ transformOrigin: `${x}px ${y}px`, animation: 'ease-ring 2.6s ease-out infinite' }} />
              <circle cx={x} cy={y} r="3.6" fill="var(--accent)" />
            </g>
          ))}
        </g>
      )}
      {view === 'back' && (
        <path d="M110 96 L110 246" stroke="var(--atlas-faint)" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" pointerEvents="none" />
      )}
    </svg>
  );
}
