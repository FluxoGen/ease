import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePregnancy } from '../context/PregnancyContext';

export default function Safety() {
  const { status, setStatus } = usePregnancy();

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
          <p className="text-sm text-black/50 dark:text-white/50">
            Your current setting:{' '}
            <strong className="text-black dark:text-white">
              {status === 'yes' ? 'Pregnant / not sure' : status === 'no' ? 'Not pregnant' : 'Not set'}
            </strong>
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-lg bg-warn-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-warn-600"
              onClick={() => setStatus('yes')}
            >
              Pregnant / not sure
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-black/10 px-4 py-2.5 text-sm font-semibold hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/15"
              onClick={() => setStatus('no')}
            >
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
