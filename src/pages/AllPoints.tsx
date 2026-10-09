import { ChevronLeft, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PointPicture from '../components/PointPicture';
import { library, type Area } from '../data/library';
import { AREAS } from '../data/library/areas';
import { CHANNELS } from '../data/library/shared';


const chip = (on: boolean) =>
  on
    ? 'shrink-0 rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-ivory dark:bg-ivory dark:text-charcoal'
    : 'shrink-0 rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-muted dark:border-ivory/20 dark:text-muted-dark';

export default function AllPoints() {
  const [params, setParams] = useSearchParams();
  const area = (params.get('area') as Area | null) ?? null;
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return library.filter((p) => {
      if (area && p.area !== area) return false;
      if (channel !== 'all' && p.channel !== channel) return false;
      if (!q) return true;
      return [p.code, p.pinyin, p.english, ...p.indications].join(' ').toLowerCase().includes(q);
    });
  }, [query, channel, area]);

  const setArea = (a: Area | null) => {
    const next = new URLSearchParams(params);
    if (a) next.set('area', a); else next.delete('area');
    setParams(next, { replace: true });
  };

  return (
    <div>
      <Link
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">All points</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">
        {library.length} points. Search by name, code or what it's used for.
      </p>

      <div className="relative mt-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. LI4, Hegu, headache, toothache"
          className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal outline-none focus:border-clay dark:border-ivory/20 dark:bg-charcoal-soft dark:text-ivory"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setArea(null)} className={chip(area === null)}>All areas</button>
        {AREAS.map((a) => (
          <button key={a.id} type="button" onClick={() => setArea(a.id)} className={chip(area === a.id)}>{a.label}</button>
        ))}
      </div>

      <select
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        aria-label="Channel"
        className="mt-2 w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none dark:border-ivory/20 dark:bg-charcoal-soft dark:text-ivory"
      >
        <option value="all">All channels</option>
        {Object.entries(CHANNELS).map(([k, v]) => (
          <option key={k} value={k}>{v}{k === 'EX' ? 's' : ''}</option>
        ))}
      </select>

      <p className="mt-3 text-xs text-muted dark:text-muted-dark">{filtered.length} of {library.length} points</p>

      <div className="mt-2 flex flex-col gap-2">
        {filtered.slice(0, 200).map((p) => (
          <Link
            key={p.id}
            to={`/point/${p.id}`}
            state={{ fromAllPoints: true }}
            className="flex items-center gap-3 rounded-xl border border-charcoal/10 bg-sand p-2.5 dark:border-ivory/10 dark:bg-charcoal-soft"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-charcoal/10 bg-white dark:border-ivory/10">
              <PointPicture point={p} compact className="h-full w-full" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-bold text-charcoal dark:text-ivory">
                {p.code}
                <span className="ml-1.5 font-normal text-muted dark:text-muted-dark">{p.pinyin}</span>
              </span>
              <span className="truncate text-xs text-muted dark:text-muted-dark">
                {p.indications.length ? p.indications.slice(0, 3).join(', ') : CHANNELS[p.channel]}
              </span>
            </div>
            {p.selfCare === 'avoid' && (
              <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                Reference only
              </span>
            )}
          </Link>
        ))}
        {filtered.length > 200 && (
          <p className="text-center text-xs text-muted dark:text-muted-dark">Showing the first 200. Search or pick an area to narrow it down.</p>
        )}
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-sm text-muted dark:text-muted-dark">No points match that search.</p>
        )}
      </div>
    </div>
  );
}
