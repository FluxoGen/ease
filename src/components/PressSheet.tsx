import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Pause, Play, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LibraryPoint } from '../data/library';
import { PRESSING_RULES, TECHNIQUES } from '../data/library/shared';
import PointPicture from './PointPicture';
import { Button, LinkButton } from './ui/Button';

interface PressSheetProps {
  point: LibraryPoint;
  open: boolean;
  onClose: () => void;
  /** 1 for midline points, 2 for left/right pairs. */
  sides: 1 | 2;
  /** Where "next" goes (the next point in the routine), if there is one. */
  next?: { to: string; label: string; state?: unknown };
}

// 4 seconds in, 6 seconds out: a slow, calming rhythm that lengthens the exhale.
const IN = 4;
const CYCLE = 10;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.ceil(s) % 60)).padStart(2, '0')}`;

/** Full-screen guided press: the logo's dot breathes while the timer runs. */
export default function PressSheet({ point, open, onClose, sides, next }: PressSheetProps) {
  const tech = TECHNIQUES[point.technique ?? 'press'];
  const total = tech.seconds;
  const [side, setSide] = useState(1);
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const endAt = useRef(0);

  const reset = useCallback((nextSide = 1) => {
    setSide(nextSide); setLeft(total); setDone(false); setRunning(true);
    endAt.current = performance.now() + total * 1000;
  }, [total]);

  // Start fresh each time the sheet opens.
  useEffect(() => { if (open) reset(1); }, [open, reset]);

  // Countdown from a wall-clock deadline so it stays accurate if the tab is throttled.
  useEffect(() => {
    if (!open || !running || done) return;
    endAt.current = performance.now() + left * 1000;
    const id = window.setInterval(() => {
      const rem = (endAt.current - performance.now()) / 1000;
      if (rem <= 0) {
        setLeft(0); setRunning(false); setDone(true);
        try { navigator.vibrate?.([120, 80, 120]); } catch { /* not supported */ }
      } else setLeft(rem);
    }, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, running, done]);

  // Keep the screen awake while pressing.
  useEffect(() => {
    if (!open || !running) return;
    let lock: { release: () => Promise<void> } | null = null;
    (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }).wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, [open, running]);

  const elapsed = total - left;
  // Screen readers hear three short announcements, not a breath cue every few seconds.
  const announce = done ? 'Finished.' : elapsed >= total / 2 ? 'Halfway.' : elapsed < 2 ? `Started. ${total} seconds.` : '';
  const phase = elapsed % CYCLE;
  const breatheIn = phase < IN;
  const progress = Math.min(1, elapsed / total);
  const R = 118;
  const C = 2 * Math.PI * R;

  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <div className="fixed inset-0 bg-paper transition-opacity duration-200 data-closed:opacity-0" aria-hidden="true" />
      <div className="fixed inset-0 flex justify-center overflow-y-auto">
        <DialogPanel className="flex min-h-full w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 transition duration-200 ease-out data-closed:translate-y-6 data-closed:opacity-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-extrabold tracking-tight">
              {point.code} <span className="font-medium text-ink-2">· {tech.label}</span>
            </DialogTitle>
            <button type="button" onClick={onClose} aria-label="Close guided press" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-card-2">
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <p className="sr-only" role="status" aria-live="polite">{announce}</p>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-atlas-paper">
              <PointPicture point={point} compact className="h-full w-full" />
            </div>
            <p className="line-clamp-3 text-[13px] leading-snug text-ink-2">{point.find}</p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-6">
            {done ? (
              <div className="text-center" role="status">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-ok-tint text-4xl text-ok">✓</div>
                <p className="mt-5 text-2xl font-extrabold tracking-tight">Nicely done.</p>
                <p className="mt-1.5 text-[15px] text-ink-2">
                  {sides === 2 && side === 1 ? 'Now do the same on the other side.' : 'Notice how that area feels.'}
                </p>
              </div>
            ) : (
              <div className="relative flex h-[17rem] w-[17rem] items-center justify-center">
                <svg viewBox="0 0 260 260" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                  <circle cx="130" cy="130" r={R} fill="none" stroke="var(--line-strong)" strokeWidth="5" />
                  <circle cx="130" cy="130" r={R} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: 'stroke-dashoffset 0.3s linear' }} />
                </svg>
                <div className="absolute inset-9 rounded-full border border-line-strong" style={{ animation: running ? `ease-breathe ${CYCLE}s ease-in-out infinite` : undefined, transformOrigin: 'center' }} />
                <div className="absolute inset-14 rounded-full bg-accent/15" style={{ animation: running ? `ease-breathe ${CYCLE}s ease-in-out infinite` : undefined, transformOrigin: 'center' }} />
                <div className="relative h-14 w-14 rounded-full bg-accent shadow-card" />
              </div>
            )}

            {!done && (
              <div className="mt-4 text-center" role="timer" aria-live="off">
                <p className="tnum text-5xl font-extrabold tracking-tight">{fmt(left)}</p>
                <p className="mt-1 text-lg font-bold text-accent-strong">{running ? (breatheIn ? 'Breathe in…' : 'Breathe out…') : 'Paused'}</p>
                <p className="mt-1 text-sm text-ink-2">{sides === 2 ? `Side ${side} of 2 · ` : ''}{tech.how}</p>
              </div>
            )}
          </div>

          {done ? (
            <div className="flex flex-col gap-2.5">
              {sides === 2 && side === 1 ? (
                <Button onClick={() => reset(2)}>Other side</Button>
              ) : next ? (
                <LinkButton to={next.to} state={next.state}>Next: {next.label}</LinkButton>
              ) : (
                <Button onClick={onClose}>Finish</Button>
              )}
              <Button variant="secondary" onClick={() => reset(side)}>
                <RotateCcw size={17} aria-hidden="true" /> Repeat
              </Button>
              {(sides === 1 || side === 2) && next && <Button variant="ghost" onClick={onClose}>Finish</Button>}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[1fr_auto] gap-2.5">
                <Button onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                  {running ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="secondary" aria-label="Restart" onClick={() => reset(side)} className="!px-4">
                  <RotateCcw size={18} aria-hidden="true" />
                </Button>
              </div>
              <ul className="space-y-1 text-center text-[13px] text-ink-2">
                {PRESSING_RULES.slice(0, 2).map((r) => <li key={r}>{r}</li>)}
              </ul>
              <Link to="/safety" onClick={onClose} className="text-center text-xs font-semibold text-ink-2 underline underline-offset-2">
                Safety information
              </Link>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
