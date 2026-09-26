import { Link, Outlet } from 'react-router-dom';
import { PregnancyContext } from './context/PregnancyContext';
import { usePregnancyStatus } from './hooks/usePregnancyStatus';
import PregnancyGate from './components/PregnancyGate';
import './App.css';

export default function App() {
  const { status, setStatus } = usePregnancyStatus();

  return (
    <PregnancyContext.Provider value={{ status, setStatus }}>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/" className="app-logo">
            Acupoint
          </Link>
          <Link to="/safety" className="app-header-link">
            Safety info
          </Link>
        </header>
        {status === 'unset' && <PregnancyGate />}
        <main className="app-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          Point photos and instructions adapted from U.S. Department of Veterans Affairs
          public-domain patient education handouts. For wellness education only — not a
          substitute for medical care.
        </footer>
      </div>
    </PregnancyContext.Provider>
  );
}
