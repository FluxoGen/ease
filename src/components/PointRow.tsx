import { ChevronRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePregnancy } from '../context/PregnancyContext';
import type { LibraryPoint } from '../data/library';
import { AREAS } from '../data/library/areas';
import { badgeText } from '../data/library/format';
import Chip from './ui/Chip';
import { GROUPED_ROW } from './ui/list';

interface PointRowProps {
  point: LibraryPoint;
  state?: unknown;
}

/** One point in a list: where it is first, then what it's used for. The code is a quiet tag. */
export default function PointRow({ point: p, state }: PointRowProps) {
  const { status } = usePregnancy();
  const blocked = status === 'yes' && p.pregnancy;
  // Until someone says it doesn't apply, a point that is traditionally avoided in pregnancy says so.
  const flagged = status !== 'no' && p.pregnancy;
  const area = AREAS.find((a) => a.id === p.area)?.label ?? '';
  const sub = [area, ...p.indications.slice(0, 3)].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/point/${p.id}`}
      state={state}
      className={`group flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-card p-2.5 pr-3 shadow-card transition active:scale-[0.99] md:hover:border-line-strong app:p-3 ${GROUPED_ROW}`}
    >
      <span className={`tnum grid h-12 w-16 max-w-[30%] shrink place-items-center overflow-hidden text-ellipsis rounded-xl text-[12px] font-extrabold ${p.selfCare === 'avoid' ? 'bg-stop-tint text-stop' : blocked ? 'bg-caution-tint text-caution' : 'bg-card-2 text-ink'}`}>
        {badgeText(p)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">
          {p.pinyin}
          <span className="ml-1.5 font-medium text-ink-2">{p.english}</span>
        </span>
        <span className="line-clamp-2 text-[13px] leading-snug text-ink-2">{sub}</span>
        {(p.selfCare === 'avoid' || flagged) && (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {p.selfCare === 'avoid' ? <Chip tone="stop" icon={ShieldAlert}>Reference only</Chip> : <Chip tone="caution">Avoid in pregnancy</Chip>}
          </span>
        )}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-3 transition group-hover:translate-x-0.5 max-[359px]:hidden" aria-hidden="true" />
    </Link>
  );
}
