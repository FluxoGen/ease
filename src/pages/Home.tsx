import { Link } from 'react-router-dom';
import { routines } from '../data/routines';

export default function Home() {
  return (
    <div className="home">
      <h1>What's going on?</h1>
      <p className="home-subtitle">
        Pick what you're dealing with to see a handful of self-acupressure points for it.
      </p>
      <div className="routine-grid">
        {routines.map((r) => (
          <Link key={r.id} to={`/routine/${r.id}`} className="routine-card">
            <span className="routine-card-title">{r.title}</span>
            <span className="routine-card-count">{r.pointIds.length} points</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
