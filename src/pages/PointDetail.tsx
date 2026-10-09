import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { AlertTriangle, ArrowRight, BadgeCheck, ChevronDown, ChevronLeft, Hand, Info, Scale, ShieldAlert, Timer } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { AppBarTitle } from '../components/app/AppChrome';
import { VIEWS } from '../components/atlas/geometry';
import PointPicture from '../components/PointPicture';
import { PregnancyAnswer } from '../components/PregnancyPrompt';
import PressSheet from '../components/PressSheet';
import Chip, { type ChipTone } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { usePregnancy } from '../context/PregnancyContext';
import { findPoint, libraryById, sidesOf } from '../data/library';
import { photoFor } from '../data/library/photos';
import { CAUTIONS, CHANNELS, PRESSING_RULES, SOURCE_SITES, TECHNIQUES } from '../data/library/shared';
import { routines, routinesById } from '../data/routines';
import { usePageTitle } from '../hooks/usePageTitle';

const EVIDENCE: Record<string, { icon: typeof BadgeCheck; tone: ChipTone; text: string }> = {
  who: { icon: BadgeCheck, tone: 'ok', text: 'Location matches WHO standard' },
  refs: { icon: Scale, tone: 'info', text: 'Cross-checked references' },
  disputed: { icon: Info, tone: 'caution', text: 'References differ' },
  va: { icon: BadgeCheck, tone: 'info', text: 'VA handout' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-2 app:text-sm app:font-semibold app:normal-case app:tracking-normal">{title}</h2>
      {children}
    </section>
  );
}

export default function PointDetail() {
  const { pointId } = useParams<{ pointId: string }>();
  const location = useLocation();
  const { status, setStatus } = usePregnancy();
  const [showDrawing, setShowDrawing] = useState(false);
  const [pressing, setPressing] = useState(false);
  const point = pointId ? findPoint(pointId) : undefined;
  usePageTitle(point ? `${point.code} ${point.pinyin}` : undefined);

  if (!point) return <Navigate to="/points" replace />;
  if (pointId !== point.id) return <Navigate to={`/point/${point.id}`} replace state={location.state} />;

  const blocked = status === 'yes' && point.pregnancy;
  // Not answered yet and this point is traditionally avoided in pregnancy: ask here, in place, before pressing.
  const needsAnswer = status === 'unset' && point.pregnancy && point.selfCare !== 'avoid';
  const navState = location.state as { fromRoutine?: string; fromAllPoints?: boolean; fromHome?: boolean } | null;
  const routine = (navState?.fromRoutine && routinesById[navState.fromRoutine]) || (navState?.fromAllPoints || navState?.fromHome ? undefined : routines.find((r) => r.pointIds.includes(point.id)));
  const back = routine
    ? { to: `/routine/${routine.id}`, label: routine.title }
    : { to: navState?.fromAllPoints ? '/points' : '/', label: navState?.fromAllPoints ? 'Search' : 'Home' };

  // Next point in this routine, skipping anything pregnancy mode hides.
  const nextId = routine?.pointIds.slice(routine.pointIds.indexOf(point.id) + 1).find((id) => {
    const p = libraryById[id];
    return p && !(status === 'yes' && p.pregnancy);
  });
  const nextPoint = nextId ? libraryById[nextId] : undefined;
  const next = nextPoint && routine ? { to: `/point/${nextPoint.id}`, label: nextPoint.code, state: { fromRoutine: routine.id } } : undefined;

  const ev = EVIDENCE[point.evidence];
  const tech = point.technique ? TECHNIQUES[point.technique] : null;
  const sides = sidesOf(point);
  const hasPhoto = Boolean(photoFor(point));
  const usedIn = routines.filter((r) => r.pointIds.includes(point.id));
  const canPress = point.selfCare !== 'avoid' && !blocked && !needsAnswer && tech;

  return (
    <div>
      <AppBarTitle title={`${point.code} ${point.pinyin}`} backTo={back.to} />
      <Link to={back.to} className="-ml-2 mb-2 app:hidden inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-ink-2 hover:text-ink">
        <ChevronLeft size={18} aria-hidden="true" />
        {back.label}
      </Link>

      <header>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h1 className="tnum text-[44px] font-extrabold leading-none tracking-tight lg:text-6xl app:selectable app:text-[38px] [@media(max-height:31.25rem)]:text-[32px]">{point.code}</h1>
          <p className="text-lg font-semibold text-ink-2">{point.pinyin}</p>
        </div>
        <p className="mt-1.5 text-[15px] text-ink-2">{[point.english, CHANNELS[point.channel] + (point.channel === 'EX' ? '' : ' channel')].filter(Boolean).join(' · ')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {point.selfCare !== 'avoid' && (
            <Link to="/safety#locations" aria-label={`${ev.text}. How locations are checked`} className="-my-2.5 inline-flex min-h-11 items-center">
              <Chip tone={ev.tone} icon={ev.icon}>{ev.text}</Chip>
            </Link>
          )}
          {point.reviewed && <Chip tone="ok" icon={BadgeCheck}>Reviewed by {point.reviewed.by}</Chip>}
          {point.selfCare === 'gentle' && <Chip tone="caution" icon={Hand}>Light touch</Chip>}
        </div>
      </header>

      {point.selfCare === 'avoid' && (
        <div role="alert" className="mt-4 flex gap-3 rounded-[var(--radius-card)] border border-stop-line bg-stop-tint p-4 text-stop">
          <ShieldAlert size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[15px] leading-relaxed"><strong>Not for pressing yourself.</strong> {point.avoidReason} Shown for reference only.</p>
        </div>
      )}

      {needsAnswer && (
        <section aria-labelledby="needs-answer" className="mt-4 rounded-[var(--radius-card)] border border-caution-line bg-caution-tint p-4 text-caution">
          <h2 id="needs-answer" className="flex items-center gap-2 font-extrabold"><ShieldAlert size={20} aria-hidden="true" /> Before you press this one</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            This point is traditionally avoided during pregnancy. Does that apply to you? If you are pregnant or not sure, talk to your medical provider first.
          </p>
          <div className="mt-3 text-ink"><PregnancyAnswer compact /></div>
        </section>
      )}

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-start lg:gap-10 wide:app:grid wide:app:grid-cols-[minmax(0,20rem)_1fr] wide:app:items-start wide:app:gap-8">
        <div className="lg:sticky lg:top-24 wide:app:sticky wide:app:top-16">
          {blocked ? (
            <div className="rounded-[var(--radius-card)] border border-caution-line bg-caution-tint p-5 text-caution">
              <div className="flex items-center gap-2 font-extrabold"><ShieldAlert size={20} aria-hidden="true" /> Hidden in pregnancy mode</div>
              <p className="mt-2 text-[15px] leading-relaxed">
                This point is traditionally avoided during pregnancy. Talk to your medical provider before using it.
              </p>
              <button type="button" onClick={() => setStatus('no')} className="mt-3 text-sm font-bold underline underline-offset-2">
                I'm not pregnant. Show it.
              </button>
            </div>
          ) : (
            <figure className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-atlas-paper shadow-card app:-mx-4 app:rounded-b-[28px] app:rounded-t-none app:border-x-0 app:border-t-0 app:shadow-none wide:app:mx-0 wide:app:rounded-[var(--radius-card)] wide:app:border">
              <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 text-xs font-bold uppercase tracking-wider text-ink-2">
                <span>{hasPhoto && !showDrawing ? 'Photo · VA handout' : VIEWS[point.view].label}</span>
                {hasPhoto && (
                  <span role="group" aria-label="Picture type" className="flex max-w-full rounded-full bg-card-2 p-0.5 normal-case tracking-normal">
                    {([false, true] as const).map((d) => (
                      <button key={String(d)} type="button" aria-pressed={showDrawing === d} onClick={() => setShowDrawing(d)} className={`min-h-11 min-w-0 rounded-full px-3.5 text-xs font-bold ${showDrawing === d ? 'bg-card text-ink shadow-card' : 'text-ink-2'}`}>
                        {d ? 'Drawing' : 'Photo'}
                      </button>
                    ))}
                  </span>
                )}
              </figcaption>
              <PointPicture point={point} drawing={showDrawing} className={`mx-auto my-3 aspect-square w-full max-w-[22rem] [@media(max-height:31.25rem)]:max-w-[12rem] ${hasPhoto && !showDrawing ? 'photo rounded-2xl bg-white p-2' : ''}`} />
            </figure>
          )}

          {canPress && (
            <div className="mt-3 hidden rounded-[var(--radius-card)] border border-line bg-card p-4 shadow-card web:wide:block">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-tint text-accent-strong"><Timer size={22} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="font-extrabold leading-tight">{tech.label} · {tech.time}</p>
                  <p className="text-[13px] text-ink-2">{sides === 2 ? 'Do both sides' : 'One spot on the midline'}</p>
                </div>
              </div>
              <Button className="mt-3 w-full" onClick={() => setPressing(true)}>Start press</Button>
            </div>
          )}
        </div>

        <div>
          <Section title="Find it">
            <p className="text-[19px] font-medium leading-relaxed text-ink app:text-[18px] app:leading-7">{point.find}</p>
          </Section>

          {point.selfCare !== 'avoid' && !blocked && point.cautions.length > 0 && (
            <ul className="mt-5 space-y-2">
              {point.cautions.map((c) => (
                <li key={c} className="flex gap-2.5 rounded-2xl border border-caution-line bg-caution-tint p-3 text-[14px] font-semibold leading-snug text-caution">
                  <AlertTriangle size={18} className="mt-px shrink-0" aria-hidden="true" />
                  {CAUTIONS[c]}
                </li>
              ))}
            </ul>
          )}

          {point.indications.length > 0 && (
            <Section title="Traditionally used for">
              <ul className="flex flex-wrap gap-2">
                {point.indications.map((t) => <li key={t}><Chip className="!px-3 !py-1.5 !text-[13px] !font-medium !text-ink">{t}</Chip></li>)}
              </ul>
            </Section>
          )}

          {usedIn.length > 0 && (
            <Section title="In routines">
              <ul className="flex flex-wrap gap-2">
                {usedIn.map((r) => (
                  <li key={r.id}>
                    <Link to={`/routine/${r.id}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold hover:border-accent">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {point.note && (
            <p className="mt-6 flex gap-2.5 rounded-2xl border border-caution-line bg-caution-tint p-3 text-[14px] leading-snug text-caution">
              <Info size={18} className="mt-px shrink-0" aria-hidden="true" />
              {point.note}
            </p>
          )}

          {next && nextPoint && (
            <Link to={next.to} state={next.state} className="mt-8 flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-card p-4 shadow-card transition active:scale-[0.99]">
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-ink-2">Next in {routine!.title}</span>
                <span className="mt-0.5 block truncate text-lg font-extrabold">{nextPoint.code} <span className="font-medium text-ink-2">{nextPoint.pinyin}</span></span>
              </span>
              <ArrowRight size={22} className="shrink-0 text-accent-strong" aria-hidden="true" />
            </Link>
          )}

          <div className="mt-7 divide-y divide-line border-y border-line">
            {point.selfCare !== 'avoid' && (
              <Disclosure as="div">
                <DisclosureButton className="group flex min-h-12 w-full items-center justify-between text-left text-sm font-bold">
                  Pressing tips
                  <ChevronDown size={18} className="transition group-data-[open]:rotate-180" aria-hidden="true" />
                </DisclosureButton>
                <DisclosurePanel as="ul" className="list-disc space-y-1 pb-3 pl-5 text-sm text-ink-2">
                  {PRESSING_RULES.map((r) => <li key={r}>{r}</li>)}
                </DisclosurePanel>
              </Disclosure>
            )}
            <Disclosure as="div">
              <DisclosureButton className="group flex min-h-12 w-full items-center justify-between text-left text-sm font-bold">
                Sources
                <ChevronDown size={18} className="transition group-data-[open]:rotate-180" aria-hidden="true" />
              </DisclosureButton>
              <DisclosurePanel as="ul" className="space-y-1 pb-3 text-sm text-ink-2">
                {point.sources.map((s) => {
                  const site = SOURCE_SITES[s.s];
                  const href = site?.base && s.p ? site.base + s.p : undefined;
                  return (
                    <li key={s.s}>
                      {href ? <a href={href} target="_blank" rel="noreferrer" className="font-medium text-accent-strong underline underline-offset-2">{site.name}</a> : site?.name ?? s.s}
                    </li>
                  );
                })}
              </DisclosurePanel>
            </Disclosure>
          </div>
        </div>
      </div>

      {canPress && (
        <>
          <div className="h-16 web:wide:hidden" aria-hidden="true" />
          <div className="pressbar fixed inset-x-0 z-20 border-t border-line bg-paper/97 px-4 py-2.5 backdrop-blur-xl web:wide:hidden">
            <div className="mx-auto flex max-w-md items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-extrabold leading-tight">{tech.label}</p>
                <p className="truncate text-xs text-ink-2">{tech.time} · {sides === 2 ? 'both sides' : 'midline'}</p>
              </div>
              <Button className="shrink-0" onClick={() => setPressing(true)}>
                <Timer size={18} aria-hidden="true" /> Start press
              </Button>
            </div>
          </div>
        </>
      )}

      {canPress && <PressSheet key={point.id} point={point} open={pressing} onClose={() => setPressing(false)} sides={sides} next={next} />}
    </div>
  );
}
