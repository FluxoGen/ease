import { ShieldCheck } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import PregnancyGate from './components/PregnancyGate';
import { PregnancyContext } from './context/PregnancyContext';
import { usePregnancyStatus } from './hooks/usePregnancyStatus';

export default function App() {
  const { status, setStatus } = usePregnancyStatus();

  return (
    <PregnancyContext.Provider value={{ status, setStatus }}>
      <div className="flex min-h-full flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-[#1c2b29]/90">
          <Link to="/" className="text-lg font-bold text-brand-600 dark:text-brand-400">
            Tsubo
          </Link>
          <Link
            to="/safety"
            className="flex items-center gap-1.5 text-sm text-black/60 hover:text-black/80 dark:text-white/60 dark:hover:text-white/80"
          >
            <ShieldCheck size={16} />
            Safety info
          </Link>
        </header>

        <PregnancyGate open={status === 'unset'} />

        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-xl px-4 pb-8 text-center text-xs text-black/50 sm:px-6 dark:text-white/40">
          Point photos and instructions adapted from U.S. Department of Veterans Affairs
          public-domain patient education handouts. For wellness education only — not a
          substitute for medical care.
        </footer>
      </div>
    </PregnancyContext.Provider>
  );
}
