import { Link, Navigate, useParams } from 'react-router-dom';
import { routinesById } from '../data/routines';
import { pointsById } from '../data/points';
import { usePregnancy } from '../context/PregnancyContext';

export default function RoutineDetail() {
  const { routineId } = useParams<{ routineId: string }>();
  const { status } = usePregnancy();
  const routine = routineId ? routinesById[routineId] : undefined;

  if (!routine) return <Navigate to="/" replace />;

  return (
    <div className="routine-detail">
      <Link to="/" className="back-link">
        ‹ All symptoms
      </Link>
      <h1>{routine.title}</h1>
      <p className="routine-description">{routine.description}</p>

      <div className="point-list">
        {routine.pointIds.map((id) => {
          const point = pointsById[id];
          if (!point) return null;
          const blocked = status === 'yes' && point.pregnancyCaution;
          return (
            <Link key={id} to={`/point/${id}`} className="point-list-item">
              <img
                src={point.image}
                alt={`${point.name} location`}
                className={blocked ? 'point-thumb point-thumb-blocked' : 'point-thumb'}
              />
              <div className="point-list-item-text">
                <span className="point-name">{point.name}</span>
                {point.altNames && (
                  <span className="point-alt-name">{point.altNames.join(', ')}</span>
                )}
                {blocked && <span className="point-caution-tag">Avoid during pregnancy</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <p className="routine-source">
        Source:{' '}
        <a href={routine.sourceUrl} target="_blank" rel="noreferrer">
          VA Portland Health Care System handout
        </a>{' '}
        (public domain)
      </p>
    </div>
  );
}
