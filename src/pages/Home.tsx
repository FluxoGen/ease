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
      <p className="mt-1 text-black/60 dark:text-white/60">
        Pick what you're dealing with to see a handful of self-acupressure points for it.
      </p>
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
                className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1c2b29]"
              >
                <Icon className="text-brand-500 dark:text-brand-400" size={26} />
                <div>
                  <div className="font-bold text-brand-600 dark:text-brand-400">{r.title}</div>
                  <div className="text-xs text-black/50 dark:text-white/50">
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
