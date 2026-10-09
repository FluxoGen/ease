import { ArrowRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BodyFigure, { type BodyView } from '../components/BodyFigure';
import Chip from '../components/ui/Chip';
import { LinkButton } from '../components/ui/Button';
import { library, type Area } from '../data/library';
import { AREAS } from '../data/library/areas';
import { ROUTINE_ICONS } from '../data/groups';
import { routinesById } from '../data/routines';

/** Symptom routines that live in each body area. */
const RELATED: Record<Area, string[]> = {
  head: ['headache', 'eye_strain', 'ear_hearing', 'toothache_jaw', 'nose_sinus', 'neck_pain'],
  'chest-belly': ['digestive_health', 'nausea', 'constipation', 'menstrual_cramps', 'cough_breathing'],
  back: ['low_back_pain', 'upper_back', 'shoulder_tension', 'neck_pain'],
  arm: ['shoulder_tension', 'hand_wrist_strain'],
  hand: ['hand_wrist_strain'],
  leg: ['knee_pain', 'hip_leg_pain'],
  foot: ['foot_ankle_strain'],
};

export default function BodyMap() {
  const [view, setView] = useState<BodyView>('front');
  const [area, setArea] = useState<Area | null>(null);
  const counts = useMemo(() => {
    const c: Partial<Record<Area, number>> = {};
    for (const p of library) c[p.area] = (c[p.area] ?? 0) + 1;
    return c;
  }, []);
  const info = area ? AREAS.find((a) => a.id === area)! : null;
  const related = area ? RELATED[area].map((id) => routinesById[id]).filter(Boolean) : [];

  const panel = useRef<HTMLDivElement>(null);
  // On a phone the result sits under the figure: bring it into view so a tap always has a visible effect.
  const pick = (a: Area) => {
    setArea(a);
    requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };
  const flip = (v: BodyView) => {
    setView(v);
    if (area === 'chest-belly' && v === 'back') setArea('back');
    else if (area === 'back' && v === 'front') setArea('chest-belly');
  };

  return (
    <div className="md:grid md:grid-cols-[minmax(0,24rem)_1fr] md:gap-12">
      <div>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl">Where does it hurt?</h1>
        <p className="mt-1.5 text-[15px] text-ink-2">Tap the area on the body.</p>

        <div role="group" aria-label="Body side" className="mt-4 inline-flex rounded-full border border-line bg-card-2 p-1">
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => flip(v)}
              className={`min-h-11 rounded-full px-5 text-sm font-bold transition ${view === v ? 'bg-card text-ink shadow-card' : 'text-ink-2'}`}
            >
              {v === 'front' ? 'Front' : 'Back'}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-4 w-full max-w-[17rem] rounded-[28px] border border-line bg-atlas-paper px-6 py-5 md:max-w-none">
          <BodyFigure view={view} selected={area} onSelect={pick} counts={counts} className="mx-auto block h-[22rem] w-auto max-w-full md:h-[32rem]" />
        </div>
      </div>

      <div ref={panel} className="mt-6 md:mt-[5.25rem]" aria-live="polite">
        {info ? (
          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-card">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">{info.label}</h2>
              <Chip tone="accent" className="tnum">{counts[info.id] ?? 0} points</Chip>
            </div>
            {related.length > 0 && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-2">Common reasons</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {related.map((r) => {
                    const Icon = ROUTINE_ICONS[r.id];
                    return (
                      <li key={r.id}>
                        <Link to={`/routine/${r.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-paper px-3.5 text-sm font-semibold hover:border-accent">
                          {Icon && <Icon size={16} className="text-accent-strong" aria-hidden="true" />}
                          {r.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <LinkButton to={`/points?area=${info.id}`} className="mt-5 w-full">
              See all {counts[info.id]} points <ArrowRight size={18} aria-hidden="true" />
            </LinkButton>
          </section>
        ) : (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 text-[15px] text-ink-2">
            Pick a spot to see the points there and the symptoms they're traditionally used for.
          </p>
        )}
      </div>
    </div>
  );
}
