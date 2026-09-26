import { usePregnancy } from '../context/PregnancyContext';

export default function PregnancyGate() {
  const { setStatus } = usePregnancy();

  return (
    <div className="pregnancy-gate" role="dialog" aria-label="Pregnancy check">
      <p>
        Are you pregnant, or think you might be? A few points are traditionally avoided during
        pregnancy, and we'll hide those for you if so.
      </p>
      <div className="pregnancy-gate-actions">
        <button type="button" className="btn btn-warning" onClick={() => setStatus('yes')}>
          Yes / not sure
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setStatus('no')}>
          No
        </button>
      </div>
    </div>
  );
}
