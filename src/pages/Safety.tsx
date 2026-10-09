import { AlertTriangle, BadgeCheck, Hand, Info, Scale, ShieldAlert, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBarTitle } from '../components/app/AppChrome';
import Chip, { type ChipTone } from '../components/ui/Chip';
import InfoCard from '../components/ui/InfoCard';
import { usePregnancy } from '../context/PregnancyContext';
import { library } from '../data/library';
import { REVIEW_STATEMENT, URGENT_SIGNS } from '../data/library/shared';
import { usePageTitle } from '../hooks/usePageTitle';

const PREGNANCY_POINTS = library.filter((p) => p.pregnancy && p.selfCare !== 'avoid').length;

const LEGEND: Array<{ tone: ChipTone; icon: LucideIcon; label: string; text: string }> = [
  { tone: 'ok', icon: BadgeCheck, label: 'Location matches WHO standard', text: 'The location agrees with the WHO 2008 standard and at least one independent reference.' },
  { tone: 'info', icon: Scale, label: 'Cross-checked references', text: "Extra points the WHO standard doesn't cover, confirmed by two or more independent references." },
  { tone: 'caution', icon: Info, label: 'References differ', text: 'Reputable sources disagree on the exact spot. The point page says how.' },
  { tone: 'info', icon: BadgeCheck, label: 'VA handout', text: 'Taught in a U.S. Veterans Affairs acupressure handout (public domain), with its photo.' },
];

/** Safety guidance only. Preferences live in Settings; the app's own details live in About. */
export default function Safety() {
  usePageTitle('Safety');
  const { status } = usePregnancy();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const setting = status === 'yes' ? 'Pregnancy mode is on.' : status === 'no' ? 'Pregnancy mode is off.' : 'Not set yet.';

  return (
    <div className="max-w-3xl">
      <AppBarTitle title="Safety" backTo="/settings" pinned />
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl app:sr-only">Safety</h1>
      <p className="mt-1 text-[15px] text-ink-2 app:mt-0">A minute here helps you use every point safely.</p>

      <div className="mt-6 space-y-4 app:mt-4">
        <InfoCard title="Get medical help first if" icon={ShieldAlert} tone="stop">
          <ul className="space-y-1.5">
            {URGENT_SIGNS.map((t) => (
              <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stop" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className="mt-3">Acupressure is for everyday aches. It should never delay care for these.</p>
        </InfoCard>

        <InfoCard id="pregnancy" title="Pregnancy" icon={ShieldAlert} tone="caution">
          <p>
            <span className="tnum">{PREGNANCY_POINTS}</span> points are traditionally avoided during pregnancy, mostly on the lower belly and
            low back, plus a few classics like LI4 and SP6. If you are pregnant or might be, talk to your medical provider before using
            acupressure.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2">
            {setting}
            <Link to="/settings#pregnancy" className="inline-flex min-h-11 items-center font-bold text-accent-strong underline underline-offset-2">Change in Settings</Link>
          </p>
        </InfoCard>

        <InfoCard title="Skip a point if" icon={AlertTriangle} tone="caution">
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {['The skin there is numb', 'There is an open wound', 'There is severe swelling', 'There is an active infection', 'There is a recent blood clot'].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-caution" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className="mt-3">You can still use the other points in a routine.</p>
        </InfoCard>

        <InfoCard title="Stop if" icon={Hand} tone="stop">
          <p>You feel pain, dizziness or anything unusual. Contact your medical provider if symptoms don't settle.</p>
        </InfoCard>

        <InfoCard id="locations" title="How locations are checked" icon={BadgeCheck}>
          <p>{REVIEW_STATEMENT}</p>
          <ul className="mt-4 space-y-3">
            {LEGEND.map((l) => (
              <li key={l.label} className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <span className="sm:w-56 sm:shrink-0"><Chip tone={l.tone} icon={l.icon}>{l.label}</Chip></span>
                <span className="text-sm">{l.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">Pictures are drawn for this app and show approximate positions. Each point page lists its sources.</p>
        </InfoCard>

        <InfoCard title="What Ease is, and isn't" icon={Info}>
          <p>
            Wellness education about traditionally used self-acupressure points. It is not a medical device, it doesn't diagnose or
            treat any condition, and it isn't a substitute for care from a licensed provider.
          </p>
        </InfoCard>
      </div>
    </div>
  );
}
