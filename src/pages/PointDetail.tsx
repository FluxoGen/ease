import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { AlertTriangle, ChevronDown, ChevronLeft } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { usePregnancy } from '../context/PregnancyContext';
import { pointsById } from '../data/points';

const TAG_LABELS: Record<string, string> = {
  low_back_pain: 'Low back',
  headache: 'Headaches',
  neck_pain: 'Neck',
  sleep: 'Sleep',
  well_being: 'Well-being',
  nausea: 'Nausea',
  stress_anxiety: 'Stress & anxiety',
};

export default function PointDetail() {
  const { pointId } = useParams<{ pointId: string }>();
  const location = useLocation();
  const { status, setStatus } = usePregnancy();
  const point = pointId ? pointsById[pointId] : undefined;

  if (!point) return <Navigate to="/" replace />;

  const blocked = status === 'yes' && point.pregnancyCaution;
  const fromRoutine = (location.state as { fromRoutine?: string } | null)?.fromRoutine;
  const backTo = fromRoutine ? `/routine/${fromRoutine}` : '/';

  return (
    <div>
      <Link
        to={backTo}
        className="mb-3 flex items-center gap-1 text-sm text-black/50 hover:text-black/70 dark:text-white/50 dark:hover:text-white/70"
      >
        <ChevronLeft size={16} />
        Back
      </Link>

      <h1 className="text-2xl font-bold sm:text-3xl">
        {point.name}
        {point.altNames && (
          <span className="ml-2 text-base font-normal text-black/50 dark:text-white/50">
            {point.altNames.join(', ')}
          </span>
        )}
      </h1>
      {point.meridian && (
        <p className="text-sm text-black/50 dark:text-white/50">{point.meridian} meridian</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {point.useTags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-black/5 px-2.5 py-1 text-xs dark:bg-white/10"
          >
            {TAG_LABELS[t] ?? t}
          </span>
        ))}
      </div>

      {blocked ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-warn-500/40 bg-warn-50 p-4 dark:border-warn-500/40 dark:bg-warn-500/10">
          <AlertTriangle className="mt-0.5 shrink-0 text-warn-600 dark:text-warn-500" size={20} />
          <p className="text-sm text-black/80 dark:text-white/80">
            <strong>Traditionally avoided during pregnancy.</strong> {point.name} is one of a
            handful of points traditionally avoided during pregnancy. Talk to your medical
            provider before using it. You marked yourself as pregnant or unsure —{' '}
            <button
              type="button"
              className="text-brand-500 underline"
              onClick={() => setStatus('no')}
            >
              change that
            </button>{' '}
            if it's no longer accurate.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10">
            <img
              src={point.image}
              alt={`${point.name} location`}
              className="max-h-80 w-full object-contain"
            />
          </div>
          <h2 className="mt-5 text-lg font-bold">Location</h2>
          <p className="mt-1 text-black/70 dark:text-white/70">{point.location}</p>
          <h2 className="mt-5 text-lg font-bold">How to use it</h2>
          <ul className="mt-1 list-disc space-y-1.5 pl-5 text-black/70 dark:text-white/70">
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

      <Disclosure as="div" className="mt-6 border-t border-black/10 pt-4 dark:border-white/10">
        <DisclosureButton className="group flex w-full items-center justify-between text-sm font-semibold">
          General cautions
          <ChevronDown size={16} className="transition group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel className="mt-2 text-sm text-black/70 dark:text-white/70">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Skip any point over numb skin, a wound, swelling, active infection, or a recent blood clot.</li>
            <li>Stop right away if you feel dizzy or otherwise unwell, and check with your provider if it doesn't pass.</li>
            <li>This is wellness information, not a treatment — it doesn't replace medical care.</li>
          </ul>
        </DisclosurePanel>
      </Disclosure>

      <p className="mt-5 text-xs text-black/40 dark:text-white/40">Source: {point.source}</p>
    </div>
  );
}
