import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChannelSheet from '../components/app/ChannelSheet';
import PointRow from '../components/PointRow';
import { GROUPED_LIST } from '../components/ui/list';
import ChipScroller from '../components/ui/ChipScroller';
import { library, type Area } from '../data/library';
import { AREAS } from '../data/library/areas';
import { CHANNELS } from '../data/library/shared';
import { search } from '../data/search';
import { usePageTitle } from '../hooks/usePageTitle';

const PAGE = 60;

const chip = (on: boolean) =>
  `min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition ${on ? 'bg-ink text-paper app:border app:border-accent-strong app:bg-accent-tint app:text-accent-strong' : 'border border-line-strong bg-card text-ink-2 hover:text-ink'}`;

export default function AllPoints() {
  usePageTitle('All points');
  const [params, setParams] = useSearchParams();
  const area = (params.get('area') as Area | null) ?? null;
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [channel, setChannel] = useState('all');
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const base = query.trim() ? search(query, 1000).points : library;
    return base.filter((p) => (!area || p.area === area) && (channel === 'all' || p.channel === channel));
  }, [query, area, channel]);

  const setArea = (a: Area | null) => {
    const next = new URLSearchParams(params);
    if (a) next.set('area', a); else next.delete('area');
    setParams(next, { replace: true });
    setShown(PAGE);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl app:sr-only">All points</h1>
      <p className="mt-1 text-[15px] text-ink-2 app:hidden"><span className="tnum">{library.length}</span> points. Search by name, code or what it's used for.</p>

      <div className="app:sticky app:top-14 app:z-10 app:-mx-4 app:bg-paper app:px-4 app:pb-1 app:pt-1">
      <div className="relative mt-4 app:mt-0">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden="true" />
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
          placeholder="e.g. LI4, Hegu or headache"
          aria-label="Search points"
          className="h-14 w-full rounded-2xl border border-line-strong bg-card pl-12 pr-12 text-base font-medium text-ink shadow-card outline-none placeholder:text-ink-2 focus:border-accent focus:ring-4 focus:ring-accent/15 app:rounded-full app:border-transparent app:bg-card-2 app:shadow-none app:focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); input.current?.focus(); }} className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:bg-card-2">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <ChipScroller label="Body area" className="mt-3 app:mt-2">
        <button type="button" onClick={() => setSheet(true)} aria-label={`Channel: ${channel === 'all' ? 'all' : CHANNELS[channel]}. Change`} className={`${chip(channel !== 'all')} hidden items-center gap-1.5 app:inline-flex`}>
          <SlidersHorizontal size={16} aria-hidden="true" /> {channel === 'all' ? 'Channel' : CHANNELS[channel]}
        </button>
        <button type="button" aria-pressed={area === null} onClick={() => setArea(null)} className={`${chip(area === null)} snap-start`}>All areas</button>
        {AREAS.map((a) => (
          <button key={a.id} type="button" aria-pressed={area === a.id} onClick={() => setArea(a.id)} className={`${chip(area === a.id)} snap-start`}>
            {a.label}
          </button>
        ))}
      </ChipScroller>
      </div>

      <label className="mt-2 block app:hidden">
        <span className="sr-only">Channel</span>
        <select
          value={channel}
          onChange={(e) => { setChannel(e.target.value); setShown(PAGE); }}
          className="min-h-11 w-full rounded-xl border border-line-strong bg-card px-3 text-sm font-semibold text-ink outline-none focus:border-accent md:w-auto"
        >
          <option value="all">All channels</option>
          {Object.entries(CHANNELS).map(([k, v]) => <option key={k} value={k}>{v}{k === 'EX' ? 's' : ''}</option>)}
        </select>
      </label>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-2" aria-live="polite">
        <span className="tnum">{results.length}</span> {results.length === 1 ? 'point' : 'points'}
      </p>

      <div className={`mt-2 ${GROUPED_LIST}`}>
        {results.slice(0, shown).map((p) => <PointRow key={p.id} point={p} state={{ fromAllPoints: true }} />)}
      </div>
      {results.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-4 min-h-12 w-full rounded-2xl border border-line-strong bg-card text-sm font-bold hover:bg-card-2">
          Show {Math.min(PAGE, results.length - shown)} more
        </button>
      )}
      <ChannelSheet open={sheet} onClose={() => setSheet(false)} value={channel} onChange={(v) => { setChannel(v); setShown(PAGE); }} />

      {results.length === 0 && (
        <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 text-[15px] text-ink-2">
          <p className="font-bold text-ink">No points match.</p>
          <p className="mt-1">Try fewer words, a point code like LI4, or clear the filters.</p>
          <button type="button" onClick={() => { setQuery(''); setChannel('all'); setArea(null); }} className="mt-3 text-sm font-bold text-accent-strong underline underline-offset-2">Clear filters</button>
        </div>
      )}
    </div>
  );
}
