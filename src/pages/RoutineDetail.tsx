import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { pointsById } from '../data/points';
import { routinesById } from '../data/routines';
import { usePregnancy } from '../context/PregnancyContext';

export default function RoutineDetail() {
  const { routineId } = useParams<{ routineId: string }>();
  const { status } = usePregnancy();
  const routine = routineId ? routinesById[routineId] : undefined;

  if (!routine) return <Navigate to="/" replace />;

  return (
    <div>
      <Link
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-black/50 hover:text-black/70 dark:text-white/50 dark:hover:text-white/70"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">{routine.title}</h1>
      <p className="mt-1 text-black/60 dark:text-white/60">{routine.description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {routine.pointIds.map((id, i) => {
          const point = pointsById[id];
          if (!point) return null;
          const blocked = status === 'yes' && point.pregnancyCaution;
          return (
            <Link key={id} to={`/point/${id}`} state={{ fromRoutine: routine.id }}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.03, ease: 'easeOut' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3.5 rounded-xl border border-black/10 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-[#1c2b29]"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10">
                  <img
                    src={point.image}
                    alt={`${point.name} location`}
                    className={`h-full w-full object-contain ${blocked ? 'blur-md grayscale' : ''}`}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">{point.name}</span>
                  {point.altNames && (
                    <span className="text-xs text-black/50 dark:text-white/50">
                      {point.altNames.join(', ')}
                    </span>
                  )}
                  {blocked && (
                    <span className="text-xs font-semibold text-warn-500">
                      Avoid during pregnancy
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-black/50 dark:text-white/40">
        Source:{' '}
        <a
          href={routine.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-brand-500 underline"
        >
          VA Portland Health Care System handout
        </a>{' '}
        (public domain)
      </p>
    </div>
  );
}
