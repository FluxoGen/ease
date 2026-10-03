import { ShieldCheck } from 'lucide-react';
import { Toaster } from 'sonner';
import { Link, Outlet, useLocation } from 'react-router-dom';
import EaseLogo from './components/EaseLogo';
import Footer from './components/Footer';
import PregnancyGate from './components/PregnancyGate';
import { PregnancyContext } from './context/PregnancyContext';
import { usePregnancyStatus } from './hooks/usePregnancyStatus';

export default function App() {
  const { status, setStatus } = usePregnancyStatus();
  const location = useLocation();

  return (
    <PregnancyContext.Provider value={{ status, setStatus }}>
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-charcoal/10 bg-sand/90 px-4 py-3 backdrop-blur sm:px-6 dark:border-ivory/10 dark:bg-charcoal-soft/90">
          <Link to="/" aria-label="Ease home">
            <EaseLogo height={22} className="dark:hidden" />
            <EaseLogo height={22} ink="#F6F3EC" className="hidden dark:block" />
          </Link>
          <Link
            to="/safety"
            state={{ from: location.pathname !== '/safety' ? location.pathname : undefined }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-charcoal dark:text-muted-dark dark:hover:text-ivory"
          >
            <ShieldCheck size={16} />
            Safety info
          </Link>
        </header>

        <PregnancyGate open={status === 'unset'} />

        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <Footer />
      </div>
      <Toaster position="bottom-center" richColors closeButton />
    </PregnancyContext.Provider>
  );
}
