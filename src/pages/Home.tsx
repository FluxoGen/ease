import { ArrowRight, Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BodyFigure from '../components/BodyFigure';
import PointRow from '../components/PointRow';
import { POPULAR, ROUTINE_ICONS, SYMPTOM_GROUPS, routineList } from '../data/groups';
import { search } from '../data/search';
import { routinesById, type Routine } from '../data/routines';
import { GROUPED_LIST } from '../components/ui/list';
import { usePageTitle } from '../hooks/usePageTitle';

function SymptomTile({ r, big }: { r: Routine; big?: boolean }) {
  const Icon = ROUTINE_ICONS[r.id];
  if (big) {
    return (
      <Link
        to={`/routine/${r.id}`}
        className="relative flex min-h-[8.5rem] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-line bg-card p-4 shadow-card transition active:scale-[0.97] md:hover:border-line-strong"
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-tint text-accent-strong">
          {Icon && <Icon size={22} aria-hidden="true" />}
        </span>
        <span className="relative">
          <span className="block text-[17px] font-extrabold leading-tight tracking-tight">{r.title}</span>
          <span className="tnum text-xs font-medium text-ink-2">{r.pointIds.length} points</span>
        </span>
      </Link>
    );
  }
  return (
    <Link
      to={`/routine/${r.id}`}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2.5 transition active:scale-[0.98] md:hover:border-line-strong"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent-strong">
        {Icon && <Icon size={18} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1 text-[14px] font-bold leading-tight">{r.title}</span>
    </Link>
  );
}

export default function Home() {
  usePageTitle();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const result = useMemo(() => search(q), [q]);
  const searching = q.trim().length > 0;
  const popular = routineList(POPULAR);

  return (
    <div>
      <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight md:text-5xl app:mt-1 app:text-[26px]">
        What's <span className="text-accent-strong">bothering</span> you?
      </h1>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-2 md:text-base app:hidden">
        Find the right pressure points, fast. Search a symptom, a body part or a point name.
      </p>

      <div className="relative mt-5 max-w-2xl app:mt-4">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden="true" />
        <input
          ref={input}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search “headache”, “LI4”…"
          aria-label="Search symptoms and points"
          enterKeyHint="search"
          className="h-14 w-full rounded-2xl border border-line-strong bg-card pl-12 pr-12 text-base font-medium text-ink shadow-card outline-none placeholder:text-ink-2 focus:border-accent focus:ring-4 focus:ring-accent/15 app:rounded-full app:border-transparent app:bg-card-2 app:shadow-none app:focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
        />
        {searching && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => { setQ(''); input.current?.focus(); }}
            className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:bg-card-2"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {searching ? (
        <div className="mt-6 max-w-2xl space-y-6" aria-live="polite">
          {result.routines.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-2">Symptoms</h2>
              <div className="grid gap-2 sm:grid-cols-2">{result.routines.map((r) => <SymptomTile key={r.id} r={r} />)}</div>
            </section>
          )}
          {result.points.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-2">Points</h2>
              <div className={GROUPED_LIST}>{result.points.map((p) => <PointRow key={p.id} point={p} state={{ fromHome: true }} />)}</div>
              {result.totalPoints > result.points.length && (
                <Link to={`/points?q=${encodeURIComponent(q.trim())}`} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-accent-strong">
                  See all {result.totalPoints} matching points <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </section>
          )}
          {result.routines.length === 0 && result.points.length === 0 && (
            <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 text-[15px] text-ink-2">
              <p className="font-bold text-ink">Nothing matches “{q.trim()}”.</p>
              <p className="mt-1">Try a body part (neck), a symptom (headache) or a point code (LI4). Or{' '}
                <Link to="/map" className="font-bold text-accent-strong underline underline-offset-2">tap the body map</Link>.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <section className="mt-8" aria-labelledby="popular">
            <h2 id="popular" className="mb-3 text-lg font-extrabold tracking-tight">Popular</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(9.5rem,100%),1fr))] gap-3 md:grid-cols-3">{popular.map((r) => <SymptomTile key={r.id} r={r} big />)}</div>
          </section>

          <Link
            to="/map"
            className="relative mt-8 app:mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 overflow-hidden rounded-[var(--radius-card)] border border-line bg-accent-tint p-5 transition active:scale-[0.99] md:p-7"
          >
            <BodyFigure view="front" className="h-36 w-auto shrink-0 md:h-44" />
            <span className="min-w-[min(11rem,100%)] flex-1">
              <span className="block text-xl font-extrabold leading-tight tracking-tight text-ink md:text-2xl">Tap where it hurts</span>
              <span className="mt-1 block text-sm text-ink-2 md:text-[15px]">Pick a spot on the body to see the points there.</span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent-strong">
                Open body map <ArrowRight size={16} aria-hidden="true" />
              </span>
            </span>
          </Link>

          <section className="mt-10" aria-labelledby="all">
            <h2 id="all" className="text-lg font-extrabold tracking-tight">All symptoms</h2>
            <div className="mt-4 grid gap-x-8 gap-y-7 md:grid-cols-2">
              {SYMPTOM_GROUPS.map((g) => (
                <div key={g.id}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-2">{g.title}</h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(min(9.5rem,100%),1fr))] gap-2">
                    {g.routines.filter((id) => routinesById[id]).map((id) => <SymptomTile key={id} r={routinesById[id]} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
