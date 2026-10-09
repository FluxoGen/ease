import { ShieldAlert } from 'lucide-react';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import EaseLogo from './components/EaseLogo';
import Footer from './components/Footer';
import PregnancyGate from './components/PregnancyGate';
import Chip from './components/ui/Chip';
import { PregnancyContext } from './context/PregnancyContext';
import { NAV, type NavState } from './data/nav';
import { usePregnancyStatus } from './hooks/usePregnancyStatus';

export default function App() {
  const { status, setStatus } = usePregnancyStatus();
  const { pathname, state } = useLocation();
  const navType = useNavigationType();
  // New pages open at the top; back/forward keeps the browser's own scroll position.
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navType]);

  return (
    <PregnancyContext.Provider value={{ status, setStatus }}>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 md:h-16 md:px-8">
            <Link to="/" aria-label="Ease home" className="shrink-0">
              <EaseLogo height={24} ink="var(--ink)" dot="var(--accent)" />
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {NAV.map(({ to, label, icon: Icon, match }) => {
                const active = match(pathname, state as NavState | null);
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-card-2 text-ink' : 'text-ink-2 hover:bg-card-2/60 hover:text-ink'}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex min-w-[2rem] justify-end">
              {status === 'yes' && (
                <Link to="/safety" aria-label="Pregnancy mode is on. Open safety settings">
                  <Chip tone="caution" icon={ShieldAlert}>Pregnancy mode</Chip>
                </Link>
              )}
            </div>
          </div>
        </header>

        <PregnancyGate open={status === 'unset'} />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-5 md:px-8 md:pt-8">
          <Outlet />
        </main>

        <Footer />
        <BottomNav />
      </div>
      <Toaster position="top-center" closeButton offset={72} toastOptions={{ className: '!rounded-2xl !border !border-line !bg-card !text-ink !shadow-pop' }} />
    </PregnancyContext.Provider>
  );
}
