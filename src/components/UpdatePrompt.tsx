import { Download, RefreshCw } from 'lucide-react';
import { applyUpdate, dismissUpdate, useUpdate } from '../update';

/**
 * A small, non-blocking card under the top bar: a new version is available. It never covers the guided press (that
 * screen sits above it) and "Later" hides it for this session. Android: Google Play downloads the update in the
 * background; website: the service worker has the new version ready and the page reloads on request.
 */
export default function UpdatePrompt() {
  const u = useUpdate();
  if (u.phase === 'none') return null;
  const app = u.source === 'play';
  const downloading = u.phase === 'downloading';
  const ready = u.phase === 'ready';

  const title = ready ? 'Update ready' : downloading ? 'Downloading update' : 'A new version of Ease is available';
  const text = ready
    ? 'Restart Ease to finish updating.'
    : downloading
      ? 'You can keep using Ease while it downloads.'
      : u.failed
        ? "The update didn't finish. Try again when you're ready."
        : app ? 'Update now, or later when it suits you.' : 'Reload to get the latest version.';
  const action = ready ? 'Restart' : app ? (u.failed ? 'Try again' : 'Update') : 'Reload';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.25rem] z-40 flex justify-center px-3 wide:justify-end wide:px-6">
      <section role="status" aria-live="polite" aria-label="App update" className="pointer-events-auto w-full max-w-md rounded-[var(--radius-card)] border border-line bg-card p-4 shadow-pop">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-tint text-accent-strong">
            {downloading ? <Download size={20} aria-hidden="true" /> : <RefreshCw size={20} aria-hidden="true" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold leading-tight tracking-tight">{title}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{text}</p>
            {downloading && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-2" role="progressbar" aria-label="Download progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={u.progress === null ? undefined : Math.round(u.progress * 100)}>
                <div className={`h-full rounded-full bg-accent ${u.progress === null ? 'w-1/3 animate-pulse' : 'transition-[width] duration-500'}`} style={u.progress === null ? undefined : { width: `${Math.round(u.progress * 100)}%` }} />
              </div>
            )}
          </div>
        </div>
        {!downloading && (
          <div className="mt-3 flex justify-end gap-2">
            {!ready && (
              <button type="button" onClick={dismissUpdate} className="min-h-11 rounded-full px-4 text-sm font-bold text-ink-2">Later</button>
            )}
            <button type="button" onClick={() => { applyUpdate(); }} className="min-h-11 rounded-full bg-accent-strong px-5 text-sm font-bold text-on-accent">{action}</button>
          </div>
        )}
      </section>
    </div>
  );
}
