import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, Navigate, useParams } from 'react-router-dom';
import PointDiagram from '../components/PointDiagram';
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
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">{routine.title}</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">{routine.description}</p>

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
                className="flex items-center gap-3.5 rounded-xl border border-charcoal/10 bg-sand p-2.5 shadow-sm dark:border-ivory/10 dark:bg-charcoal-soft"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-charcoal/10 bg-white dark:border-ivory/10">
                  {point.image ? (
                    <img
                      src={point.image}
                      alt={`${point.name} location`}
                      className={`h-full w-full object-contain ${blocked ? 'blur-md grayscale' : ''}`}
                    />
                  ) : point.bodyMap ? (
                    <PointDiagram
                      x={point.bodyMap.x}
                      y={point.bodyMap.y}
                      className={`h-full w-full ${blocked ? 'blur-md grayscale' : ''}`}
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-charcoal dark:text-ivory">{point.name}</span>
                  {point.altNames && (
                    <span className="text-xs text-muted dark:text-muted-dark">
                      {point.altNames.join(', ')}
                    </span>
                  )}
                  {blocked && (
                    <span className="text-xs font-semibold text-warn-500">
                      Avoid during pregnancy
                    </span>
                  )}
                  {!point.verified && !blocked && (
                    <span className="text-xs font-semibold text-clay-dark dark:text-clay">
                      Not yet reviewed
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted dark:text-muted-dark">
        {routine.sourceUrl ? (
          <>
            Source:{' '}
            <a
              href={routine.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-clay-dark underline dark:text-clay"
            >
              VA public-domain handout
            </a>
          </>
        ) : (
          routine.sourceNote
        )}
      </p>
      {routine.extraNote && (
        <p className="mt-2 text-xs text-muted dark:text-muted-dark">{routine.extraNote}</p>
      )}
    </div>
  );
}
