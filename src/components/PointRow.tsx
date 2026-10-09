import { ChevronRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePregnancy } from '../context/PregnancyContext';
import type { LibraryPoint } from '../data/library';
import { AREAS } from '../data/library/areas';
import { badgeText } from '../data/library/format';
import Chip from './ui/Chip';

interface PointRowProps {
  point: LibraryPoint;
  state?: unknown;
}

/** One point in a list: where it is first, then what it's used for. The code is a quiet tag. */
export default function PointRow({ point: p, state }: PointRowProps) {
  const { status } = usePregnancy();
  const blocked = status === 'yes' && p.pregnancy;
  const area = AREAS.find((a) => a.id === p.area)?.label ?? '';
  const sub = [area, ...p.indications.slice(0, 3)].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/point/${p.id}`}
      state={state}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 pr-3 shadow-card transition active:scale-[0.99] md:hover:border-line-strong"
    >
      <span className={`tnum grid h-12 w-16 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold ${p.selfCare === 'avoid' ? 'bg-stop-tint text-stop' : blocked ? 'bg-caution-tint text-caution' : 'bg-card-2 text-ink'}`}>
        {badgeText(p)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold leading-snug text-ink">
          {p.pinyin}
          <span className="ml-1.5 font-medium text-ink-2">{p.english}</span>
        </span>
        <span className="line-clamp-2 text-[13px] leading-snug text-ink-2">{sub}</span>
      </span>
      {p.selfCare === 'avoid' ? (
        <Chip tone="stop" icon={ShieldAlert} className="shrink-0">Reference only</Chip>
      ) : blocked ? (
        <Chip tone="caution" className="shrink-0">Avoid in pregnancy</Chip>
      ) : null}
      <ChevronRight size={18} className="shrink-0 text-ink-3 transition group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
