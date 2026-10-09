import { HeartHandshake, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePregnancy } from '../context/PregnancyContext';
import { PREGNANCY_ANSWERS } from '../data/library/shared';
import { persistNative } from '../native';
import { Button } from './ui/Button';

const NUDGE_KEY = 'ease.pregnancyNudge';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const snoozed = () => {
  try {
    const at = Number(localStorage.getItem(NUDGE_KEY));
    return Boolean(at) && Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
};

/** Both answers, as two plain buttons. Used on Home and on a point that needs the answer. */
export function PregnancyAnswer({ compact = false }: { compact?: boolean }) {
  const { setStatus } = usePregnancy();
  const choose = (v: 'yes' | 'no') => { setStatus(v); toast.success(PREGNANCY_ANSWERS[v]); };
  return (
    <div className={compact ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2.5'}>
      <Button variant="secondary" onClick={() => choose('yes')} className={compact ? '!min-h-12 !px-2 !text-[14px] leading-tight' : ''}>Pregnant or not sure</Button>
      <Button variant="secondary" onClick={() => choose('no')} className={compact ? '!min-h-12 !px-2 !text-[14px] leading-tight' : ''}>Doesn't apply to me</Button>
    </div>
  );
}

/**
 * A gentle, optional card on Home. It never blocks anything and never appears on first launch: a few points
 * are traditionally avoided in pregnancy, so we offer to set them aside. "Not now" hides it for two weeks, and
 * a point that needs the answer asks again in place, so nobody can start one of those points unwarned.
 */
export default function PregnancyPrompt() {
  const { status } = usePregnancy();
  const [hidden, setHidden] = useState(snoozed);
  if (status !== 'unset' || hidden) return null;

  const later = () => {
    const now = String(Date.now());
    try { localStorage.setItem(NUDGE_KEY, now); } catch { /* ignore */ }
    persistNative(NUDGE_KEY, now);
    setHidden(true);
  };

  return (
    <section aria-labelledby="preg-nudge" className="relative mt-5 rounded-[var(--radius-card)] border border-line bg-card p-4 shadow-card app:shadow-none">
      <button type="button" onClick={later} aria-label="Not now" className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-ink-2">
        <X size={18} aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-tint text-accent-strong"><HeartHandshake size={22} aria-hidden="true" /></span>
        <div>
          <h2 id="preg-nudge" className="text-[17px] font-extrabold leading-tight tracking-tight">Keep it safe for you</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
            A few points are traditionally avoided during pregnancy. Tell us if that might apply and we'll set them aside. Totally optional.
          </p>
        </div>
      </div>
      <div className="mt-3"><PregnancyAnswer compact /></div>
    </section>
  );
}
