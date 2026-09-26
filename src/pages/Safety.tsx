import { Link } from 'react-router-dom';
import { usePregnancy } from '../context/PregnancyContext';

export default function Safety() {
  const { status, setStatus } = usePregnancy();

  return (
    <div className="safety-page">
      <Link to="/" className="back-link">
        ‹ Back
      </Link>
      <h1>Safety information</h1>

      <section>
        <h2>Pregnancy</h2>
        <p>
          A handful of points in this app (LI4, SP6, UB60) are traditionally avoided during
          pregnancy. If you are pregnant or think you might be, talk to your medical provider
          before using acupressure, and this app will hide instructions for those specific points.
        </p>
        <div className="pregnancy-status-control">
          <span>Your current setting: </span>
          <strong>
            {status === 'yes' ? 'Pregnant / not sure' : status === 'no' ? 'Not pregnant' : 'Not set'}
          </strong>
          <div className="pregnancy-gate-actions">
            <button type="button" className="btn btn-warning" onClick={() => setStatus('yes')}>
              Pregnant / not sure
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setStatus('no')}>
              Not pregnant
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2>When to skip a point</h2>
        <ul>
          <li>Numb skin</li>
          <li>An open wound</li>
          <li>Severe swelling</li>
          <li>Active infection</li>
          <li>A recent blood clot</li>
        </ul>
        <p>Skip any point in these areas — you can still use the other points in a routine.</p>
      </section>

      <section>
        <h2>Stop if</h2>
        <p>
          You feel discomfort, dizziness, or any other unusual symptom. Contact your medical
          provider if symptoms don't stop.
        </p>
      </section>

      <section>
        <h2>What this app is (and isn't)</h2>
        <p>
          This is wellness education about traditionally-used self-acupressure points. It is not
          a medical device, it does not diagnose or treat any condition, and it isn't a substitute
          for care from a licensed provider.
        </p>
      </section>

      <section>
        <h2>Sources</h2>
        <p>
          Point selections, groupings, and photos are adapted from public-domain patient education
          handouts published by the VA Portland Health Care System and the VHA Office of Patient
          Centered Care and Cultural Transformation (U.S. federal government works, 17 U.S.C. §105).
        </p>
      </section>
    </div>
  );
}
