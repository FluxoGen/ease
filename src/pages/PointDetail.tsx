import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { AlertTriangle, BadgeCheck, ChevronDown, ChevronLeft, Info, Scale } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { VIEWS } from '../components/atlas/geometry';
import PointPicture from '../components/PointPicture';
import { photoFor } from '../data/library/photos';
import { usePregnancy } from '../context/PregnancyContext';
import { findPoint } from '../data/library';
import { CAUTIONS, CHANNELS, PRESSING_RULES, SOURCE_SITES, TECHNIQUES } from '../data/library/shared';
import { routines } from '../data/routines';

const EVIDENCE = {
  who: { icon: BadgeCheck, text: 'Location matches the WHO standard', tone: 'text-[#3c7a52] dark:text-[#8fd1a6]' },
  refs: { icon: Scale, text: 'Location from 2+ independent references', tone: 'text-[#3f6b8a] dark:text-[#9cc3e0]' },
  disputed: { icon: Info, text: 'References differ on the exact spot', tone: 'text-amber-700 dark:text-amber-300' },
  va: { icon: BadgeCheck, text: 'From a U.S. VA acupressure handout', tone: 'text-[#3c7a52] dark:text-[#8fd1a6]' },
} as const;

export default function PointDetail() {
  const { pointId } = useParams<{ pointId: string }>();
  const location = useLocation();
  const { status, setStatus } = usePregnancy();
  const point = pointId ? findPoint(pointId) : undefined;
  const [showDrawing, setShowDrawing] = useState(false);

  if (!point) return <Navigate to="/points" replace />;
  if (pointId !== point.id) return <Navigate to={`/point/${point.id}`} replace state={location.state} />;

  const blocked = status === 'yes' && point.pregnancy;
  const navState = location.state as { fromRoutine?: string; fromBodyMap?: boolean; fromAllPoints?: boolean } | null;
  const fallbackRoutine = routines.find((r) => r.pointIds.includes(point.id));
  const backTo = navState?.fromBodyMap
    ? '/map'
    : navState?.fromAllPoints
      ? '/points'
      : navState?.fromRoutine
        ? `/routine/${navState.fromRoutine}`
        : fallbackRoutine
          ? `/routine/${fallbackRoutine.id}`
          : '/points';
  const ev = EVIDENCE[point.evidence];
  const tech = point.technique ? TECHNIQUES[point.technique] : null;
  const photo = Boolean(photoFor(point));
  const usedIn = routines.filter((r) => r.pointIds.includes(point.id));

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
        {point.code}
        <span className="ml-2 text-base font-normal text-muted dark:text-muted-dark">{point.pinyin}</span>
      </h1>
      <p className="text-sm text-muted dark:text-muted-dark">
        {[point.english, CHANNELS[point.channel] + (point.channel === 'EX' ? '' : ' channel')].filter(Boolean).join(' · ')}
      </p>
      <p className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${ev.tone}`}>
        <ev.icon size={16} />
        {ev.text}
        <Link to="/safety#locations" className="font-normal underline underline-offset-2 opacity-80">
          how we check
        </Link>
      </p>

      {blocked ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-warn-500/40 bg-warn-50 p-4 dark:bg-warn-500/10">
          <AlertTriangle className="mt-0.5 shrink-0 text-warn-600 dark:text-warn-500" size={20} />
          <p className="text-sm text-charcoal/80 dark:text-ivory/80">
            <strong>Traditionally avoided during pregnancy.</strong> Talk to your medical provider before
            using it. You marked yourself as pregnant or unsure —{' '}
            <button type="button" className="text-clay-dark underline dark:text-clay" onClick={() => setStatus('no')}>
              change that
            </button>{' '}
            if it's no longer accurate.
          </p>
        </div>
      ) : (
        <>
          <figure className="mt-4 overflow-hidden rounded-2xl border border-charcoal/10 bg-[#fbf8f2] dark:border-ivory/10">
            <figcaption className="flex items-center justify-between px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-[#8A6650]">
              <span>{photo && !showDrawing ? 'Photo · VA handout' : VIEWS[point.view].label}</span>
              {photo && (
                <button type="button" className="normal-case underline underline-offset-2" onClick={() => setShowDrawing((v) => !v)}>
                  {showDrawing ? 'Show photo' : 'Show drawing'}
                </button>
              )}
            </figcaption>
            <PointPicture
              point={point}
              drawing={showDrawing}
              className="mx-auto my-2 h-72 w-72 max-w-[calc(100%-2rem)] rounded-xl bg-white"
            />
          </figure>

          <h2 className="mt-5 text-lg font-bold">Find it</h2>
          <p className="mt-1 text-charcoal/80 dark:text-ivory/80">{point.find}</p>

          {point.selfCare === 'avoid' ? (
            <div className="mt-5 flex gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
              <Info size={20} className="mt-0.5 shrink-0" />
              <p>
                <strong>Not for pressing yourself.</strong> {point.avoidReason} Shown for reference only.
              </p>
            </div>
          ) : (
            tech && (
              <>
                <h2 className="mt-5 text-lg font-bold">How to press</h2>
                <p className="mt-1 text-charcoal/80 dark:text-ivory/80">
                  <strong>{tech.label}, {tech.time}.</strong> {tech.how}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-charcoal/70 dark:text-ivory/70">
                  {PRESSING_RULES.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </>
            )
          )}

          {point.selfCare !== 'avoid' && point.cautions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {point.cautions.map((c) => (
                <li key={c} className="flex gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  {CAUTIONS[c]}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {point.indications.length > 0 && (
        <>
          <h2 className="mt-5 text-lg font-bold">Traditionally used for</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {point.indications.map((t) => (
              <span key={t} className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs dark:bg-ivory/10">{t}</span>
            ))}
          </div>
        </>
      )}
      {usedIn.length > 0 && (
        <p className="mt-3 text-sm text-muted dark:text-muted-dark">
          In routines:{' '}
          {usedIn.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ', '}
              <Link to={`/routine/${r.id}`} className="underline underline-offset-2">{r.title}</Link>
            </span>
          ))}
        </p>
      )}

      {point.note && (
        <p className="mt-4 rounded-lg bg-charcoal/5 p-3 text-sm text-charcoal/70 dark:bg-ivory/10 dark:text-ivory/70">{point.note}</p>
      )}

      <Disclosure as="div" className="mt-6 border-t border-charcoal/10 pt-4 dark:border-ivory/10">
        <DisclosureButton className="group flex w-full items-center justify-between text-sm font-semibold">
          Sources
          <ChevronDown size={16} className="transition group-data-[open]:rotate-180" />
        </DisclosureButton>
        <DisclosurePanel as="ul" className="mt-2 space-y-1 text-sm text-charcoal/70 dark:text-ivory/70">
          {point.sources.map((s) => {
            const site = SOURCE_SITES[s.s];
            const name = site?.name ?? s.s;
            const href = site?.base && s.p ? site.base + s.p : undefined;
            return (
              <li key={s.s}>
                {href ? <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">{name}</a> : name}
              </li>
            );
          })}
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
