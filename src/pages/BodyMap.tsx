import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BodySilhouette from '../components/BodySilhouette';
import { BODY_MAP_VIEWBOX } from '../data/bodyMap';
import { points } from '../data/points';
import { usePregnancy } from '../context/PregnancyContext';

export default function BodyMap() {
  const [view, setView] = useState<'front' | 'back'>('front');
  const { status } = usePregnancy();
  const shown = points.filter((p) => p.bodyMap?.view === view);

  return (
    <div>
      <Link
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        All symptoms
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">Body Map</h1>
      <p className="mt-1 text-muted dark:text-muted-dark">
        Tap a point to see how to use it. A schematic diagram — not to anatomical scale.
      </p>

      <div className="mt-4 inline-flex rounded-lg border border-charcoal/15 p-1 dark:border-ivory/20">
        {(['front', 'back'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={
              view === v
                ? 'rounded-md bg-charcoal px-4 py-1.5 text-sm font-semibold text-ivory dark:bg-ivory dark:text-charcoal'
                : 'rounded-md px-4 py-1.5 text-sm font-semibold text-muted dark:text-muted-dark'
            }
          >
            {v === 'front' ? 'Front' : 'Back'}
          </button>
        ))}
      </div>

      <div className="relative mx-auto mt-4 max-w-[280px]">
        <BodySilhouette className="w-full text-charcoal/60 dark:text-ivory/50" />
        <svg
          viewBox={`0 0 ${BODY_MAP_VIEWBOX.width} ${BODY_MAP_VIEWBOX.height}`}
          className="absolute inset-0 h-full w-full"
        >
          {shown.map((p) => {
            const blocked = status === 'yes' && p.pregnancyCaution;
            return (
              <Link key={p.id} to={`/point/${p.id}`} state={{ fromBodyMap: true }}>
                {blocked ? (
                  // Hollow ring, not just a different color — a shape
                  // difference reads clearly even for colorblind users.
                  <circle
                    cx={p.bodyMap!.x}
                    cy={p.bodyMap!.y}
                    r={8}
                    className="fill-white stroke-warn-500 dark:fill-charcoal-soft"
                    strokeWidth={3}
                  />
                ) : (
                  <circle
                    cx={p.bodyMap!.x}
                    cy={p.bodyMap!.y}
                    r={8}
                    className="fill-clay stroke-white hover:fill-clay-dark"
                    strokeWidth={2}
                  />
                )}
              </Link>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted dark:text-muted-dark">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-clay" />
          Point
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-warn-500 bg-white dark:bg-charcoal-soft" />
          Avoid during pregnancy
        </span>
      </div>

      <p className="mt-4 text-sm text-muted dark:text-muted-dark">
        {shown.length} points shown on this view. Hand and foot points sit close together at this
        scale — zoom in or check the routine list if a tap opens the wrong one.
      </p>
    </div>
  );
}
