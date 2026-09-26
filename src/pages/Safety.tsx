import { Check, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { usePregnancy } from '../context/PregnancyContext';

export default function Safety() {
  const { status, setStatus } = usePregnancy();

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
        to="/"
        className="mb-3 flex items-center gap-1 text-sm text-black/50 hover:text-black/70 dark:text-white/50 dark:hover:text-white/70"
      >
        <ChevronLeft size={16} />
        Back
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">Safety information</h1>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Pregnancy</h2>
        <p className="mt-1 text-black/70 dark:text-white/70">
          A handful of points in this app (LI4, SP6, UB60) are traditionally avoided during
          pregnancy. If you are pregnant or think you might be, talk to your medical provider
          before using acupressure, and this app will hide instructions for those specific
          points.
        </p>
        <div className="mt-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#1c2b29]">
          <p className="mb-3 text-sm text-black/50 dark:text-white/50">Which applies to you?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              aria-pressed={status === 'yes'}
              className={
                status === 'yes'
                  ? 'flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-warn-500 px-4 py-2.5 text-sm font-semibold text-white ring-2 ring-warn-500 ring-offset-2 ring-offset-white dark:ring-offset-[#1c2b29]'
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
                  ? 'flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-[#1c2b29]'
                  : 'flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/15 px-4 py-2.5 text-sm font-semibold text-black/70 hover:bg-black/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10'
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
        <ul className="mt-1 list-disc space-y-1 pl-5 text-black/70 dark:text-white/70">
          <li>Numb skin</li>
          <li>An open wound</li>
          <li>Severe swelling</li>
          <li>Active infection</li>
          <li>A recent blood clot</li>
        </ul>
        <p className="mt-2 text-black/70 dark:text-white/70">
          Skip any point in these areas — you can still use the other points in a routine.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Stop if</h2>
        <p className="mt-1 text-black/70 dark:text-white/70">
          You feel discomfort, dizziness, or any other unusual symptom. Contact your medical
          provider if symptoms don't stop.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">What this app is (and isn't)</h2>
        <p className="mt-1 text-black/70 dark:text-white/70">
          This is wellness education about traditionally-used self-acupressure points. It is not
          a medical device, it does not diagnose or treat any condition, and it isn't a
          substitute for care from a licensed provider.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Sources</h2>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Point selections, groupings, and photos are adapted from public-domain patient
          education handouts published by the VA Portland Health Care System and the VHA Office
          of Patient Centered Care and Cultural Transformation (U.S. federal government works,
          17 U.S.C. §105).
        </p>
      </section>
    </div>
  );
}
