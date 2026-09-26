import {
  Activity,
  Battery,
  Brain,
  Feather,
  Flower2,
  Frown,
  HeartPulse,
  Moon,
  Move,
  PersonStanding,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { routines } from '../data/routines';
import type { UseTag } from '../types';

const ROUTINE_ICONS: Record<UseTag, LucideIcon> = {
  low_back_pain: Activity,
  headache: Brain,
  neck_pain: Move,
  sleep: Moon,
  well_being: HeartPulse,
  nausea: Frown,
  stress_anxiety: Feather,
  menstrual_cramps: Flower2,
  cold_flu: Thermometer,
  energy_fatigue: Battery,
};

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">What's going on?</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">
        Pick what you're dealing with to see a handful of self-acupressure points for it.
      </p>

      <Link
        to="/map"
        className="mt-4 flex items-center gap-2 rounded-xl border border-charcoal/10 bg-sand px-4 py-3 text-sm font-semibold text-charcoal shadow-sm dark:border-ivory/10 dark:bg-charcoal-soft dark:text-ivory"
      >
        <PersonStanding size={20} className="text-clay-dark dark:text-clay" />
        Browse by body area instead
      </Link>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {routines.map((r, i) => {
          const Icon = ROUTINE_ICONS[r.id];
          return (
            <Link key={r.id} to={`/routine/${r.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: 'easeOut' }}
                whileTap={{ scale: 0.96 }}
                className="flex min-h-[9.5rem] flex-col justify-between gap-3 rounded-2xl border border-charcoal/10 bg-sand p-5 shadow-sm dark:border-ivory/10 dark:bg-charcoal-soft"
              >
                <Icon className="text-charcoal/70 dark:text-ivory/70" size={26} />
                <div>
                  <div className="line-clamp-2 font-bold text-charcoal dark:text-ivory">
                    {r.title}
                  </div>
                  <div className="text-xs text-muted dark:text-muted-dark">
                    {r.pointIds.length} points
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
