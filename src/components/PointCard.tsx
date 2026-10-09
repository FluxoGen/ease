import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePregnancy } from '../context/PregnancyContext';
import type { LibraryPoint } from '../data/library';
import PointPicture from './PointPicture';
import Chip from './ui/Chip';

interface PointCardProps {
  point: LibraryPoint;
  step: number;
  state?: unknown;
}

/** A numbered step in a routine: picture, name and the first line of how to find it. */
export default function PointCard({ point: p, step, state }: PointCardProps) {
  const { status } = usePregnancy();
  const blocked = status === 'yes' && p.pregnancy;
  return (
    <Link
      to={`/point/${p.id}`}
      state={state}
      className="group flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] border border-line bg-card p-3 shadow-card transition active:scale-[0.99] md:hover:border-line-strong"
    >
      <span className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-atlas-paper">
        <PointPicture point={p} compact className={`h-full w-full ${blocked ? 'blur-md grayscale' : ''}`} />
        <span className="tnum absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-extrabold text-paper">{step}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-extrabold leading-tight tracking-tight">
          {p.code} <span className="font-medium text-ink-2">{p.pinyin}</span>
        </span>
        {blocked ? (
          <Chip tone="caution" className="mt-1">Avoid in pregnancy</Chip>
        ) : (
          <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink-2">{p.find}</span>
        )}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-3 transition group-hover:translate-x-0.5 max-[359px]:hidden" aria-hidden="true" />
    </Link>
  );
}
