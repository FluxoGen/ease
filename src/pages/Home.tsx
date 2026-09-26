import { Activity, Brain, HeartPulse, Moon, Move, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routines } from '../data/routines';
import type { UseTag } from '../types';

const ROUTINE_ICONS: Record<UseTag, LucideIcon> = {
  low_back_pain: Activity,
  headache: Brain,
  neck_pain: Move,
  sleep: Moon,
  well_being: HeartPulse,
};

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">What's going on?</h1>
      <p className="mt-1 text-black/60 dark:text-white/60">
        Pick what you're dealing with to see a handful of self-acupressure points for it.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {routines.map((r) => {
          const Icon = ROUTINE_ICONS[r.id];
          return (
            <Link
              key={r.id}
              to={`/routine/${r.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 transition active:scale-[0.98] dark:border-white/10 dark:bg-[#1c2b29]"
            >
              <Icon className="text-brand-500 dark:text-brand-400" size={26} />
              <div>
                <div className="font-bold text-brand-600 dark:text-brand-400">{r.title}</div>
                <div className="text-xs text-black/50 dark:text-white/50">
                  {r.pointIds.length} points
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
