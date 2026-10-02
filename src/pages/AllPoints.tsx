import { ChevronLeft, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PointDiagram from '../components/PointDiagram';
import RegionDiagram from '../components/RegionDiagram';
import { hasRegionDiagram } from '../data/pointDiagrams';
import { points } from '../data/points';

const MERIDIAN_ORDER = [
  'Lung', 'Large Intestine', 'Stomach', 'Spleen', 'Heart', 'Small Intestine',
  'Urinary Bladder', 'Kidney', 'Pericardium', 'Triple Energizer', 'Gallbladder', 'Liver',
  'Governing Vessel', 'Conception Vessel',
];

export default function AllPoints() {
  const [query, setQuery] = useState('');
  const [meridianFilter, setMeridianFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const meridians = useMemo(() => {
    const present = new Set(points.map((p) => p.meridian ?? 'Extra points'));
    return MERIDIAN_ORDER.filter((m) => present.has(m)).concat(
      present.has('Extra points') ? ['Extra points'] : [],
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return points.filter((p) => {
      if (verifiedFilter === 'verified' && !p.verified) return false;
      if (verifiedFilter === 'pending' && p.verified) return false;
      const m = p.meridian ?? 'Extra points';
      if (meridianFilter !== 'all' && m !== meridianFilter) return false;
      if (!q) return true;
      const haystack = [p.name, ...(p.altNames ?? []), p.region, m].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [query, meridianFilter, verifiedFilter]);

  return (
    <div>
      <Link
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">All Points</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">
        Every point in this app, searchable — {points.length} total, including ones not yet in a
        symptom routine.
      </p>

      <div className="relative mt-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, e.g. 'LI4' or 'Hegu'"
          className="w-full rounded-lg border border-charcoal/15 bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal outline-none focus:border-clay dark:border-ivory/20 dark:bg-charcoal-soft dark:text-ivory"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {(['all', 'verified', 'pending'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVerifiedFilter(v)}
            className={
              verifiedFilter === v
                ? 'shrink-0 rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-ivory dark:bg-ivory dark:text-charcoal'
                : 'shrink-0 rounded-full border border-charcoal/15 px-3 py-1.5 text-xs font-semibold text-muted dark:border-ivory/20 dark:text-muted-dark'
            }
          >
            {v === 'all' ? 'All' : v === 'verified' ? 'VA-sourced' : 'Pending review'}
          </button>
        ))}
      </div>

      <select
        value={meridianFilter}
        onChange={(e) => setMeridianFilter(e.target.value)}
        className="mt-2 w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none dark:border-ivory/20 dark:bg-charcoal-soft dark:text-ivory"
      >
        <option value="all">All meridians</option>
        {meridians.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <p className="mt-3 text-xs text-muted dark:text-muted-dark">
        {filtered.length} of {points.length} points
      </p>

      <div className="mt-2 flex flex-col gap-2">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/point/${p.id}`}
            state={{ fromAllPoints: true }}
            className="flex items-center gap-3 rounded-xl border border-charcoal/10 bg-sand p-2.5 dark:border-ivory/10 dark:bg-charcoal-soft"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-charcoal/10 bg-white dark:border-ivory/10">
              {p.image ? (
                <img src={p.image} alt="" className="h-full w-full object-contain" />
              ) : hasRegionDiagram(p.id) ? (
                <RegionDiagram pointId={p.id} compact className="h-full w-full bg-[#fbf8f2]" />
              ) : p.bodyMap ? (
                <PointDiagram x={p.bodyMap.x} y={p.bodyMap.y} className="h-full w-full" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-bold text-charcoal dark:text-ivory">
                {p.name}
                {p.altNames && (
                  <span className="ml-1.5 font-normal text-muted dark:text-muted-dark">
                    {p.altNames[0]}
                  </span>
                )}
              </span>
              <span className="truncate text-xs text-muted dark:text-muted-dark">
                {p.meridian ?? 'Extra point'} &middot; {p.region}
              </span>
            </div>
            {!p.verified && (
              <span className="ml-auto shrink-0 rounded-full bg-clay/15 px-2 py-1 text-[10px] font-semibold text-clay-dark dark:bg-clay/20 dark:text-clay">
                Pending
              </span>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="mt-4 text-center text-sm text-muted dark:text-muted-dark">
            No points match that search.
          </p>
        )}
      </div>
    </div>
  );
}
