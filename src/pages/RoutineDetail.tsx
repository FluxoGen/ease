import { ChevronDown, ChevronLeft, ExternalLink, Play, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import PointCard from '../components/PointCard';
import PointRow from '../components/PointRow';
import Chip from '../components/ui/Chip';
import { LinkButton } from '../components/ui/Button';
import { usePregnancy } from '../context/PregnancyContext';
import { ROUTINE_ICONS } from '../data/groups';
import { libraryById, sidesOf } from '../data/library';
import { TECHNIQUES, URGENT_LINE } from '../data/library/shared';
import { routinesById } from '../data/routines';
import { usePageTitle } from '../hooks/usePageTitle';

/** Steps shown as cards; the rest are compact rows so long routines stay scannable. */
const STEPS = 6;

export default function RoutineDetail() {
  const { routineId } = useParams<{ routineId: string }>();
  const { status } = usePregnancy();
  const [all, setAll] = useState(false);
  const routine = routineId ? routinesById[routineId] : undefined;
  usePageTitle(routine?.title);
  if (!routine) return <Navigate to="/" replace />;

  const Icon = ROUTINE_ICONS[routine.id];
  const points = routine.pointIds.map((id) => libraryById[id]).filter(Boolean);
  const first = points.find((p) => !(status === 'yes' && p.pregnancy));
  const steps = points.slice(0, STEPS);
  const more = points.slice(STEPS);
  const state = { fromRoutine: routine.id };
  // Pregnancy mode skips flagged points, so they don't count toward the steps or the time.
  const doable = steps.filter((p) => p.technique && !(status === 'yes' && p.pregnancy));
  const minutes = Math.max(1, Math.round(doable.reduce((sum, p) => sum + TECHNIQUES[p.technique!].seconds * sidesOf(p), 0) / 60));

  return (
    <div className="max-w-3xl">
      <Link to="/" className="-ml-2 mb-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-ink-2 hover:text-ink">
        <ChevronLeft size={18} aria-hidden="true" />
        Home
      </Link>

      <header className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-accent-tint text-accent-strong">
          {Icon && <Icon size={28} aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <h1 className="text-[30px] font-extrabold leading-tight tracking-tight md:text-4xl">{routine.title}</h1>
          <p className="mt-1 text-[15px] text-ink-2">{routine.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip className="tnum">{points.length} points</Chip>
            {routine.sourceUrl && routine.core.length > 0 && (
              <a href={routine.sourceUrl} target="_blank" rel="noreferrer" className="-my-2.5 inline-flex min-h-11 max-w-full items-center">
                <Chip icon={ExternalLink}>First {routine.core.length} from a VA handout</Chip>
              </a>
            )}
          </div>
        </div>
      </header>

      {first && (
        <div className="mt-5">
          <LinkButton to={`/point/${first.id}`} state={state} className="w-full sm:w-auto">
            <Play size={18} aria-hidden="true" /> Start routine
          </LinkButton>
          <p className="mt-2 text-[13px] text-ink-2">
            <span className="tnum">{doable.length}</span> {doable.length === 1 ? 'step' : 'steps'}, about <span className="tnum">{minutes}</span> min. We'll guide you point by point.
          </p>
        </div>
      )}

      {routine.urgent && (
        <p className="mt-4 flex gap-2.5 rounded-2xl border border-caution-line bg-caution-tint p-3 text-[13px] font-medium leading-snug text-caution">
          <ShieldAlert size={18} className="mt-px shrink-0" aria-hidden="true" />
          {URGENT_LINE}
        </p>
      )}

      <section className="mt-8" aria-labelledby="steps">
        <h2 id="steps" className="mb-3 text-lg font-extrabold tracking-tight">Start here</h2>
        <div className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(min(20rem,100%),1fr))]">
          {steps.map((p, i) => <PointCard key={p.id} point={p} step={i + 1} state={state} />)}
        </div>
      </section>

      {more.length > 0 && (
        <section className="mt-8" aria-labelledby="more">
          <h2 id="more" className="mb-3 text-lg font-extrabold tracking-tight">More points <span className="tnum font-medium text-ink-2">({more.length})</span></h2>
          {all && (
            <div className="flex flex-col gap-2">{more.map((p) => <PointRow key={p.id} point={p} state={state} />)}</div>
          )}
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            aria-expanded={all}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-1.5 rounded-2xl border border-line-strong bg-card text-sm font-bold hover:bg-card-2"
          >
            {all ? 'Show fewer' : `Show ${more.length} more`}
            <ChevronDown size={18} className={all ? 'rotate-180' : ''} aria-hidden="true" />
          </button>
        </section>
      )}
    </div>
  );
}
