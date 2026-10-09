import { Check, ChevronRight, ExternalLink, HeartHandshake, Info, Mail, Monitor, Moon, Palette, ShieldCheck, Sun, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import InfoCard from '../components/ui/InfoCard';
import VersionLine from '../components/VersionLine';
import { usePregnancy } from '../context/PregnancyContext';
import { CONTACT_EMAIL, PREGNANCY_ANSWERS, PRIVACY_URL, TERMS_URL } from '../data/library/shared';
import { usePageTitle } from '../hooks/usePageTitle';
import { setThemePref, useTheme, type ThemePref } from '../theme';

const THEMES: Array<{ id: ThemePref; label: string; icon: LucideIcon }> = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
];

function Appearance() {
  const { pref } = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-2">
      {THEMES.map(({ id, label, icon: Icon }) => {
        const on = pref === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setThemePref(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-sm font-bold transition ${on ? 'border-accent-strong bg-accent-tint text-accent-strong' : 'border-line bg-paper text-ink-2'}`}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PregnancySetting() {
  const { status, setStatus } = usePregnancy();
  const choose = (v: 'yes' | 'no') => { setStatus(v); toast.success(PREGNANCY_ANSWERS[v]); };
  const option = (value: 'yes' | 'no', label: string, hint: string) => {
    const on = status === value;
    return (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={on}
        onClick={() => choose(value)}
        className={`flex min-h-16 flex-1 items-center gap-3 rounded-2xl border-2 px-4 text-left transition ${on ? 'border-accent-strong bg-accent-tint' : 'border-line bg-paper'}`}
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
    <>
      <p>Some points are traditionally avoided during pregnancy. If it might apply to you, we'll set those points aside and skip them in routines.</p>
      <div role="radiogroup" aria-label="Pregnancy" className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        {option('yes', 'Pregnant or not sure', 'Set those points aside')}
        {option('no', "Doesn't apply to me", 'Show every point')}
      </div>
      {status === 'unset' && <p className="mt-3 text-sm">Not set yet. We'll ask again before a point that needs it.</p>}
    </>
  );
}

/** One tappable row in a settings list. */
function Row({ icon: Icon, title, hint, to, href }: { icon: LucideIcon; title: string; hint?: string; to?: string; href?: string }) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent-strong"><Icon size={20} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-tight text-ink">{title}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">{hint}</span>}
      </span>
      {to ? <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden="true" /> : <ExternalLink size={16} className="shrink-0 text-ink-3" aria-hidden="true" />}
    </>
  );
  const cls = 'flex min-h-16 items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0';
  return to ? <Link to={to} className={cls}>{inner}</Link> : <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={cls}>{inner}</a>;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-2 px-1 text-sm font-semibold text-ink-2">{title}</h2>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">{children}</div>
    </section>
  );
}

export default function Settings() {
  usePageTitle('Settings');
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-4xl app:sr-only">Settings</h1>
      <div className="mt-5 space-y-6 app:mt-3">
        <InfoCard id="appearance" title="Appearance" icon={Palette}><Appearance /></InfoCard>

        <InfoCard id="pregnancy" title="Pregnancy" icon={HeartHandshake} tone="caution"><PregnancySetting /></InfoCard>

        <Group title="Safety and help">
          <Row icon={ShieldCheck} title="Safety guide" hint="When to get medical help, skip a point or stop" to="/safety" />
          <Row icon={Info} title="How locations are checked" hint="Where the point locations come from" to="/safety#locations" />
        </Group>

        <Group title="About">
          <Row icon={Info} title="About Ease" hint="FluxoGen, privacy and credits" to="/about" />
          <Row icon={ExternalLink} title="Privacy policy" href={PRIVACY_URL} />
          <Row icon={ExternalLink} title="Terms of use" href={TERMS_URL} />
          <Row icon={Mail} title="Send feedback" hint={CONTACT_EMAIL} href={`mailto:${CONTACT_EMAIL}?subject=Ease%20feedback`} />
        </Group>

        <div className="pb-2 text-center text-xs text-ink-2">
          <p className="font-semibold text-ink">Ease · FluxoGen</p>
          <VersionLine className="mt-0.5" />
        </div>
      </div>
    </div>
  );
}
