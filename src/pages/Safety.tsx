import { AlertTriangle, BadgeCheck, Check, Hand, Info, Scale, ShieldAlert, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Chip, { type ChipTone } from '../components/ui/Chip';
import { usePregnancy } from '../context/PregnancyContext';
import { library } from '../data/library';
import { REVIEW_STATEMENT, URGENT_SIGNS } from '../data/library/shared';

const PREGNANCY_POINTS = library.filter((p) => p.pregnancy && p.selfCare !== 'avoid').length;

function Card({ id, title, icon: Icon, tone = 'neutral', children }: { id?: string; title: string; icon: LucideIcon; tone?: 'neutral' | 'caution' | 'stop'; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === 'caution' ? 'bg-caution-tint text-caution' : tone === 'stop' ? 'bg-stop-tint text-stop' : 'bg-accent-tint text-accent-strong'}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="mt-3 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

const LEGEND: Array<{ tone: ChipTone; icon: LucideIcon; label: string; text: string }> = [
  { tone: 'ok', icon: BadgeCheck, label: 'Location matches WHO standard', text: 'The location agrees with the WHO 2008 standard and at least one independent reference.' },
  { tone: 'info', icon: Scale, label: 'Cross-checked references', text: "Extra points the WHO standard doesn't cover, confirmed by two or more independent references." },
  { tone: 'caution', icon: Info, label: 'References differ', text: 'Reputable sources disagree on the exact spot. The point page says how.' },
  { tone: 'info', icon: BadgeCheck, label: 'VA handout', text: 'Taught in a U.S. Veterans Affairs acupressure handout (public domain), with its photo.' },
];

export default function Safety() {
  const { status, setStatus } = usePregnancy();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const choose = (value: 'yes' | 'no') => {
    setStatus(value);
    toast.success(value === 'yes' ? "Got it. We'll hide points traditionally avoided in pregnancy." : 'Got it. You will see every point.');
  };

  const option = (value: 'yes' | 'no', label: string, hint: string) => {
    const on = status === value;
    return (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={on}
        onClick={() => choose(value)}
        className={`flex min-h-16 flex-1 items-center gap-3 rounded-2xl border-2 px-4 text-left transition ${on ? 'border-accent-strong bg-accent-tint' : 'border-line bg-paper hover:border-line-strong'}`}
      >
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-accent-strong bg-accent-strong text-on-accent' : 'border-line-strong'}`}>
          {on && <Check size={14} strokeWidth={3} aria-hidden="true" />}
        </span>
        <span>
          <span className="block text-[15px] font-extrabold text-ink">{label}</span>
          <span className="block text-xs text-ink-2">{hint}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl">Safety</h1>
      <p className="mt-1 text-[15px] text-ink-2">A minute here helps you use every point safely.</p>

      <div className="mt-6 space-y-4">
        <Card title="Pregnancy" icon={ShieldAlert} tone="caution">
          <p>
            <span className="tnum">{PREGNANCY_POINTS}</span> points are traditionally avoided during pregnancy, mostly on the lower belly and
            low back, plus a few classics like LI4 and SP6. If you are pregnant or might be, talk to your medical provider before using
            acupressure. We'll hide those points for you.
          </p>
          <div role="radiogroup" aria-label="Pregnancy" className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            {option('no', "I'm not pregnant", 'Show every point')}
            {option('yes', "Pregnant or not sure", 'Hide the points to avoid')}
          </div>
        </Card>

        <Card title="Get medical help first if" icon={ShieldAlert} tone="stop">
          <ul className="space-y-1.5">
            {URGENT_SIGNS.map((t) => (
              <li key={t} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stop" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className="mt-3">Acupressure is for everyday aches. It should never delay care for these.</p>
        </Card>

        <Card title="Skip a point if" icon={AlertTriangle} tone="caution">
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {['The skin there is numb', 'There is an open wound', 'There is severe swelling', 'There is an active infection', 'There is a recent blood clot'].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-caution" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className="mt-3">You can still use the other points in a routine.</p>
        </Card>

        <Card title="Stop if" icon={Hand} tone="stop">
          <p>You feel pain, dizziness or anything unusual. Contact your medical provider if symptoms don't settle.</p>
        </Card>

        <Card id="locations" title="How locations are checked" icon={BadgeCheck}>
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
        </Card>

        <Card title="What Ease is, and isn't" icon={Info}>
          <p>
            Wellness education about traditionally used self-acupressure points. It is not a medical device, it doesn't diagnose or
            treat any condition, and it isn't a substitute for care from a licensed provider.
          </p>
          <p className="mt-3">
            Photos and point selections for the first routines come from public-domain patient education handouts by the VA Portland
            Health Care System and the VHA Office of Patient Centered Care (U.S. federal government works, 17 U.S.C. §105).
          </p>
        </Card>
      </div>
    </div>
  );
}
