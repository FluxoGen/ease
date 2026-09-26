import { Link, Navigate, useParams } from 'react-router-dom';
import { pointsById } from '../data/points';
import { usePregnancy } from '../context/PregnancyContext';

const TAG_LABELS: Record<string, string> = {
  low_back_pain: 'Low back',
  headache: 'Headaches',
  neck_pain: 'Neck',
  sleep: 'Sleep',
  well_being: 'Well-being',
};

export default function PointDetail() {
  const { pointId } = useParams<{ pointId: string }>();
  const { status, setStatus } = usePregnancy();
  const point = pointId ? pointsById[pointId] : undefined;

  if (!point) return <Navigate to="/" replace />;

  const blocked = status === 'yes' && point.pregnancyCaution;

  return (
    <div className="point-detail">
      <Link to="/" className="back-link">
        ‹ Back
      </Link>
      <h1>
        {point.name}
        {point.altNames && <span className="point-alt-name-inline"> · {point.altNames.join(', ')}</span>}
      </h1>
      {point.meridian && <p className="point-meridian">{point.meridian} meridian</p>}

      <div className="point-tags">
        {point.useTags.map((t) => (
          <span key={t} className="tag">
            {TAG_LABELS[t] ?? t}
          </span>
        ))}
      </div>

      {blocked ? (
        <div className="warning-block">
          <strong>Traditionally avoided during pregnancy.</strong>
          <p>
            {point.name} is one of a handful of points traditionally avoided during pregnancy.
            Talk to your medical provider before using it. You marked yourself as pregnant or
            unsure —{' '}
            <button type="button" className="link-button" onClick={() => setStatus('no')}>
              change that
            </button>{' '}
            if it's no longer accurate.
          </p>
        </div>
      ) : (
        <>
          <img src={point.image} alt={`${point.name} location`} className="point-detail-image" />
          <h2>Location</h2>
          <p>{point.location}</p>
          <h2>How to use it</h2>
          <ul className="instructions">
            <li>Press or rub the point with your thumb or finger for about 30 seconds.</li>
            <li>Use pressure that feels good, not painful.</li>
            <li>Do the same point on both sides of the body if it has a left and right.</li>
            <li>Repeat as needed, up to five times a day.</li>
          </ul>
        </>
      )}

      {point.pregnancyCaution && !blocked && (
        <p className="pregnancy-note">
          Traditionally avoided during pregnancy — talk to your medical provider first if that
          applies to you.
        </p>
      )}

      <details className="general-cautions">
        <summary>General cautions</summary>
        <ul>
          <li>Skip any point over numb skin, a wound, swelling, active infection, or a recent blood clot.</li>
          <li>Stop right away if you feel dizzy or otherwise unwell, and check with your provider if it doesn't pass.</li>
          <li>This is wellness information, not a treatment — it doesn't replace medical care.</li>
        </ul>
      </details>

      <p className="point-source">Source: {point.source}</p>
    </div>
  );
}
