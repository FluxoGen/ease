import { Check, ChevronLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { usePregnancy } from '../context/PregnancyContext';
import { library } from '../data/library';
import { REVIEW_STATEMENT } from '../data/library/shared';

const PREGNANCY_POINTS = library.filter((p) => p.pregnancy && p.selfCare !== 'avoid').map((p) => p.code);

export default function Safety() {
  const { status, setStatus } = usePregnancy();
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? '/';

  const choose = (value: 'yes' | 'no') => {
    setStatus(value);
    toast.success(
      value === 'yes'
        ? "Got it — we'll hide points traditionally avoided during pregnancy."
        : "Got it — you'll see all points.",
    );
  };

  return (
    <div>
      <Link
        to={backTo}
        className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
      >
        <ChevronLeft size={16} />
        Back
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">Safety information</h1>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Pregnancy</h2>
        <p className="mt-1 text-charcoal/70 dark:text-ivory/70">
          {PREGNANCY_POINTS.length} points in this app are traditionally avoided during pregnancy,
          mostly on the lower belly, low back and a few classic ones like LI4 and SP6. If you are
          pregnant or think you might be, talk to your medical provider before using acupressure,
          and this app will hide instructions for those points.
        </p>
        <div className="mt-3 rounded-xl border border-charcoal/10 bg-sand p-4 dark:border-ivory/10 dark:bg-charcoal-soft">
          <p className="mb-3 text-sm text-muted dark:text-muted-dark">Which applies to you?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              aria-pressed={status === 'yes'}
              className={
                status === 'yes'
                  ? 'flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-warn-500 px-4 py-2.5 text-sm font-semibold text-white ring-2 ring-warn-500 ring-offset-2 ring-offset-sand dark:ring-offset-charcoal-soft'
                  : 'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-warn-500/40 px-4 py-2.5 text-sm font-semibold text-warn-600 hover:bg-warn-50 dark:text-warn-500 dark:hover:bg-warn-500/10'
              }
              onClick={() => choose('yes')}
            >
              {status === 'yes' && <Check size={16} />}
              Pregnant / not sure
            </button>
            <button
              type="button"
              aria-pressed={status === 'no'}
              className={
                status === 'no'
                  ? 'flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold text-ivory ring-2 ring-charcoal ring-offset-2 ring-offset-sand dark:bg-ivory dark:text-charcoal dark:ring-ivory dark:ring-offset-charcoal-soft'
                  : 'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-charcoal/15 px-4 py-2.5 text-sm font-semibold text-charcoal/70 hover:bg-charcoal/5 dark:border-ivory/20 dark:text-ivory/70 dark:hover:bg-ivory/10'
              }
              onClick={() => choose('no')}
            >
              {status === 'no' && <Check size={16} />}
              Not pregnant
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">When to skip a point</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-charcoal/70 dark:text-ivory/70">
          <li>Numb skin</li>
          <li>An open wound</li>
          <li>Severe swelling</li>
          <li>Active infection</li>
          <li>A recent blood clot</li>
        </ul>
        <p className="mt-2 text-charcoal/70 dark:text-ivory/70">
          Skip any point in these areas — you can still use the other points in a routine.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Stop if</h2>
        <p className="mt-1 text-charcoal/70 dark:text-ivory/70">
          You feel discomfort, dizziness, or any other unusual symptom. Contact your medical
          provider if symptoms don't stop.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">What this app is (and isn't)</h2>
        <p className="mt-1 text-charcoal/70 dark:text-ivory/70">
          This is wellness education about traditionally-used self-acupressure points. It is not
          a medical device, it does not diagnose or treat any condition, and it isn't a
          substitute for care from a licensed provider.
        </p>
      </section>

      <section id="locations" className="mt-6 scroll-mt-20">
        <h2 className="text-lg font-bold">How point locations are checked</h2>
        <p className="mt-1 text-charcoal/70 dark:text-ivory/70">{REVIEW_STATEMENT}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-charcoal/70 dark:text-ivory/70">
          <li><strong>Matches the WHO standard:</strong> the location agrees with the WHO 2008 standard and at least one independent reference.</li>
          <li><strong>2+ independent references:</strong> extra points the WHO standard doesn't cover, confirmed by at least two independent references.</li>
          <li><strong>References differ:</strong> reputable sources disagree on the exact spot; the point page says how.</li>
          <li><strong>VA handout:</strong> taught in a U.S. Veterans Affairs acupressure handout (public domain), with its photo.</li>
        </ul>
        <p className="mt-2 text-sm text-charcoal/70 dark:text-ivory/70">
          Pictures are drawn for this app and show approximate positions. Each point page lists its sources.
        </p>
      </section>
    </div>
  );
}
