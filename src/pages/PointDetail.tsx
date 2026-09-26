import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { AlertTriangle, ChevronDown, ChevronLeft } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import PointDiagram from '../components/PointDiagram';
import { usePregnancy } from '../context/PregnancyContext';
import { pointsById } from '../data/points';
import { routines } from '../data/routines';
import type { FivePhase } from '../types';

const TAG_LABELS: Record<string, string> = {
  low_back_pain: 'Low back',
  headache: 'Headaches',
  neck_pain: 'Neck',
  sleep: 'Sleep',
  well_being: 'Well-being',
  nausea: 'Nausea',
  stress_anxiety: 'Stress & anxiety',
  menstrual_cramps: 'Menstrual cramps',
  cold_flu: 'Cold & flu',
  energy_fatigue: 'Energy & fatigue',
};

const PHASE_COLOR: Record<FivePhase, string> = {
  wood: '#4a7c4e',
  fire: '#c2483d',
  earth: '#b8863b',
  metal: '#8a8f94',
  water: '#3f6b8a',
};

export default function PointDetail() {
  const { pointId } = useParams<{ pointId: string }>();
  const location = useLocation();
  const { status, setStatus } = usePregnancy();
  const point = pointId ? pointsById[pointId] : undefined;

  if (!point) return <Navigate to="/" replace />;

  const blocked = status === 'yes' && point.pregnancyCaution;
  const navState = location.state as { fromRoutine?: string; fromBodyMap?: boolean } | null;
  // Falls back to any routine containing this point (never home) — covers
  // hard reloads and direct deep links, where router state isn't available.
  const fallbackRoutine = routines.find((r) => r.pointIds.includes(point.id));
  const backTo = navState?.fromBodyMap
    ? '/map'
    : navState?.fromRoutine
      ? `/routine/${navState.fromRoutine}`
      : fallbackRoutine
        ? `/routine/${fallbackRoutine.id}`
        : '/';

  return (
    <div>
      <Link
        to={backTo}
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        Back
      </Link>

      <h1 className="text-2xl font-bold sm:text-3xl">
        {point.name}
        {point.altNames && (
          <span className="ml-2 text-base font-normal text-muted dark:text-muted-dark">
            {point.altNames.join(', ')}
          </span>
        )}
      </h1>
      {point.meridian && (
        <p className="text-sm text-muted dark:text-muted-dark">{point.meridian} meridian</p>
      )}

      {!point.verified && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-warn-50 px-2.5 py-1.5 text-xs font-medium text-warn-600 dark:bg-warn-500/10 dark:text-warn-500">
          <AlertTriangle size={14} />
          Not yet reviewed by a licensed acupuncturist — location is a best estimate.
        </div>
      )}

      {point.useTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {point.useTags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs dark:bg-ivory/10"
            >
              {TAG_LABELS[t] ?? t}
            </span>
          ))}
        </div>
      )}

      {(point.classicalGroups || point.fivePhase) && (
        <div className="mt-3 text-sm text-muted dark:text-muted-dark">
          {point.fivePhase && (
            <span className="mr-2 inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PHASE_COLOR[point.fivePhase] }}
              />
              {point.fivePhase[0].toUpperCase() + point.fivePhase.slice(1)} phase
            </span>
          )}
          {point.classicalGroups?.join(' · ')}
        </div>
      )}

      {blocked ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-warn-500/40 bg-warn-50 p-4 dark:border-warn-500/40 dark:bg-warn-500/10">
          <AlertTriangle className="mt-0.5 shrink-0 text-warn-600 dark:text-warn-500" size={20} />
          <p className="text-sm text-charcoal/80 dark:text-ivory/80">
            <strong>Traditionally avoided during pregnancy.</strong> {point.name} is one of a
            handful of points traditionally avoided during pregnancy. Talk to your medical
            provider before using it. You marked yourself as pregnant or unsure —{' '}
            <button
              type="button"
              className="text-clay-dark underline dark:text-clay"
              onClick={() => setStatus('no')}
            >
              change that
            </button>{' '}
            if it's no longer accurate.
          </p>
        </div>
      ) : (
        <>
          {point.image ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-charcoal/10 bg-white dark:border-ivory/10">
              <img
                src={point.image}
                alt={`${point.name} location`}
                className="max-h-80 w-full object-contain"
              />
            </div>
          ) : point.bodyMap ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-charcoal/10 bg-sand dark:border-ivory/10 dark:bg-charcoal-soft">
              <PointDiagram x={point.bodyMap.x} y={point.bodyMap.y} className="mx-auto h-56 w-56" />
              <p className="pb-3 text-center text-xs text-muted dark:text-muted-dark">
                Diagram, not a photo — approximate location only.
              </p>
            </div>
          ) : null}
          <h2 className="mt-5 text-lg font-bold">Location</h2>
          <p className="mt-1 text-charcoal/70 dark:text-ivory/70">{point.location}</p>
          <h2 className="mt-5 text-lg font-bold">How to use it</h2>
          <ul className="mt-1 list-disc space-y-1.5 pl-5 text-charcoal/70 dark:text-ivory/70">
            <li>Press or rub the point with your thumb or finger for about 30 seconds.</li>
            <li>Use pressure that feels good, not painful.</li>
            <li>Do the same point on both sides of the body if it has a left and right.</li>
            <li>Repeat as needed, up to five times a day.</li>
          </ul>
        </>
      )}

      {point.pregnancyCaution && !blocked && (
        <p className="mt-3 text-sm font-medium text-warn-500">
          Traditionally avoided during pregnancy — talk to your medical provider first if that
          applies to you.
        </p>
      )}

      <Disclosure as="div" className="mt-6 border-t border-charcoal/10 pt-4 dark:border-ivory/10">
        <DisclosureButton className="group flex w-full items-center justify-between text-sm font-semibold">
          General cautions
          <ChevronDown size={16} className="transition group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel className="mt-2 text-sm text-charcoal/70 dark:text-ivory/70">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Skip any point over numb skin, a wound, swelling, active infection, or a recent blood clot.</li>
            <li>Stop right away if you feel dizzy or otherwise unwell, and check with your provider if it doesn't pass.</li>
            <li>This is wellness information, not a treatment — it doesn't replace medical care.</li>
          </ul>
        </DisclosurePanel>
      </Disclosure>

      <p className="mt-5 text-xs text-muted dark:text-muted-dark">Source: {point.source}</p>
    </div>
  );
}
