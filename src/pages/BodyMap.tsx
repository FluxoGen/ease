import { ArrowRight, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BodyFigure, { type BodyView } from '../components/BodyFigure';
import Chip from '../components/ui/Chip';
import { LinkButton } from '../components/ui/Button';
import { library, type Area } from '../data/library';
import { AREAS } from '../data/library/areas';
import { ROUTINE_ICONS } from '../data/groups';
import { routinesById } from '../data/routines';
import { usePageTitle } from '../hooks/usePageTitle';

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
  usePageTitle('Where does it hurt?');
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
    <div className="lg:grid lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-12">
      <div>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl app:sr-only">Where does it hurt?</h1>
        <p className="mt-1.5 text-[15px] text-ink-2 app:mt-1 app:text-center">Tap the area on the body.</p>

        <div role="group" aria-label="Body side" className="mt-4 grid w-full max-w-[16rem] grid-cols-2 rounded-full border border-line bg-card-2 p-1 app:mx-auto app:max-w-xs">
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => flip(v)}
              className={`min-h-11 rounded-full px-3 text-sm font-bold transition ${view === v ? 'bg-card text-ink shadow-card' : 'text-ink-2'}`}
            >
              {v === 'front' ? 'Front' : 'Back'}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-4 w-full max-w-[17rem] rounded-[28px] border border-line bg-atlas-paper px-6 py-5 lg:max-w-none app:border-0 app:py-3">
          <BodyFigure view={view} selected={area} onSelect={pick} counts={counts} className={`mx-auto block h-[22rem] w-auto max-w-full md:h-[28rem] lg:h-[32rem] app:transition-[height] app:duration-200 ${info ? 'app:h-[max(18rem,min(17rem,31dvh))]' : 'app:h-[max(21rem,min(30rem,52dvh))]'}`} />
        </div>
      </div>

      <div ref={panel} className={`mt-6 lg:mt-[5.25rem] ${info ? 'app:pb-56' : ''}`} aria-live="polite">
        {info ? (
          <section className="rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-card app:app-sheet app:fixed app:inset-x-0 app:bottom-[var(--nav-h)] app:z-20 app:mx-auto app:max-w-3xl app:rounded-b-none app:border-x-0 app:border-b-0 app:pb-4 app:pt-5 app:shadow-pop wide:app:bottom-0">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">{info.label}</h2>
              <span className="flex items-center gap-1">
                <Chip tone="accent" className="tnum">{counts[info.id] ?? 0} points</Chip>
                <button type="button" aria-label="Close" data-back-closes onClick={() => setArea(null)} className="-mr-2 hidden h-11 w-11 items-center justify-center rounded-full text-ink-2 app:flex"><X size={20} aria-hidden="true" /></button>
              </span>
            </div>
            {related.length > 0 && (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-2">Common reasons</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {related.map((r) => {
                    const Icon = ROUTINE_ICONS[r.id];
                    return (
                      <li key={r.id}>
                        <Link to={`/routine/${r.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-semibold hover:border-accent">
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
          <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 text-[15px] text-ink-2 app:hidden">
            Pick a spot to see the points there and the symptoms they're traditionally used for.
          </p>
        )}
      </div>
    </div>
  );
}
