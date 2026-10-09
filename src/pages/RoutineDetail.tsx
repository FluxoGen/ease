import { ChevronDown, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import PointPicture from '../components/PointPicture';
import { usePregnancy } from '../context/PregnancyContext';
import { libraryById } from '../data/library';
import { routinesById } from '../data/routines';

/** Show this many points before "Show all", so long routines stay scannable. */
const FIRST = 8;

export default function RoutineDetail() {
  const { routineId } = useParams<{ routineId: string }>();
  const { status } = usePregnancy();
  const [all, setAll] = useState(false);
  const routine = routineId ? routinesById[routineId] : undefined;

  if (!routine) return <Navigate to="/" replace />;
  const ids = all ? routine.pointIds : routine.pointIds.slice(0, FIRST);

  return (
    <div>
      <Link
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">{routine.title}</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">{routine.description}</p>
      {routine.core.length > 0 && routine.sourceUrl && (
        <p className="mt-2 text-xs text-muted dark:text-muted-dark">
          The first {routine.core.length} points follow a{' '}
          <a href={routine.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">VA acupressure handout</a>.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ids.map((id, i) => {
          const point = libraryById[id];
          if (!point) return null;
          const blocked = status === 'yes' && point.pregnancy;
          return (
            <Link key={id} to={`/point/${id}`} state={{ fromRoutine: routine.id }} className="block min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i, 8) * 0.03, ease: 'easeOut' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3.5 rounded-xl border border-charcoal/10 bg-sand p-2.5 shadow-sm dark:border-ivory/10 dark:bg-charcoal-soft"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-charcoal/10 bg-white dark:border-ivory/10">
                  <PointPicture point={point} compact className={`h-full w-full ${blocked ? 'blur-md grayscale' : ''}`} />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-bold text-charcoal dark:text-ivory">
                    {point.code}
                    <span className="ml-1.5 font-normal text-muted dark:text-muted-dark">{point.pinyin}</span>
                  </span>
                  <span className="truncate text-xs text-muted dark:text-muted-dark">{point.find}</span>
                  {blocked && <span className="text-xs font-semibold text-warn-500">Avoid during pregnancy</span>}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
      {routine.pointIds.length > FIRST && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-charcoal/10 py-2.5 text-sm font-semibold dark:border-ivory/10"
        >
          {all ? 'Show fewer' : `Show all ${routine.pointIds.length} points`}
          <ChevronDown size={16} className={all ? 'rotate-180' : ''} />
        </button>
      )}
    </div>
  );
}
