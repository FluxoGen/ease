import { ShieldAlert } from 'lucide-react';
import { Toaster } from 'sonner';
import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import EaseLogo from './components/EaseLogo';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import Chip from './components/ui/Chip';
import { PregnancyContext } from './context/PregnancyContext';
import { NAV, type NavState } from './data/nav';
import { usePregnancyStatus } from './hooks/usePregnancyStatus';
import { AppBar, AppNav, BarProvider } from './components/app/AppChrome';
import { isDetail } from './components/app/barContext';
import { initNative, isApp } from './native';

export default function App() {
  const { status, setStatus } = usePregnancyStatus();
  const location = useLocation();
  const { pathname, state } = location;
  const navType = useNavigationType();
  const navigate = useNavigate();
  // Android back button (no-op on the web). The listener is registered once and reads the latest location.
  const here = useRef(location);
  useEffect(() => { here.current = location; }, [location]);
  useEffect(() => initNative({
    goBack: () => navigate(-1),
    goHome: () => {
      if (here.current.pathname === '/') return false;
      navigate('/', { replace: true });
      return true;
    },
  }), [navigate]);
  // New pages open at the top; back/forward keeps the browser's own scroll position.
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navType]);

  if (isApp) {
    return <AppLayout status={status} setStatus={setStatus} />;
  }

  return (
    <PregnancyContext.Provider value={{ status, setStatus }}>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 wide:min-h-16 md:px-8">
            <Link to="/" aria-label="Ease home" className="-mx-2 flex min-h-11 shrink-0 items-center px-2">
              <EaseLogo height={24} ink="var(--ink)" dot="var(--accent)" />
            </Link>

            <nav aria-label="Main" className="hidden min-w-0 flex-wrap items-center justify-center gap-1 wide:flex">
              {NAV.map(({ to, label, icon: Icon, match }) => {
                const active = match(pathname, state as NavState | null);
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${active ? 'bg-card-2 text-ink' : 'text-ink-2 hover:bg-card-2/60 hover:text-ink'}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex min-w-[2rem] items-center justify-end gap-2">
              <ThemeToggle />
              {status === 'yes' && (
                <Link to="/settings#pregnancy" aria-label="Pregnancy mode is on. Open settings">
                  <Chip tone="caution" icon={ShieldAlert}>Pregnancy mode</Chip>
                </Link>
              )}
            </div>
          </div>
        </header>

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

/** The Android app layout: app bar on top, navigation bar below, no website header or footer. */
function AppLayout({ status, setStatus }: { status: ReturnType<typeof usePregnancyStatus>['status']; setStatus: ReturnType<typeof usePregnancyStatus>['setStatus'] }) {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const detail = isDetail(pathname);
  // Tab to tab fades; opening a detail screen slides in; going back slides out.
  const motion = navType === 'POP' ? 'pop' : navType === 'PUSH' && detail ? 'push' : '';

  return (
    <PregnancyContext.Provider value={{ status, setStatus }}>
      <BarProvider>
        <div className={`flex min-h-dvh flex-col ${detail ? '' : 'wide:pl-20'}`}>
          <AppBar status={status} />
          <main className={`mx-auto w-full max-w-3xl flex-1 px-4 pt-2 ${detail ? 'pb-8' : 'pb-[calc(var(--nav-h)+1.5rem)] wide:pb-8'}`}>
            <div key={pathname} className={`app-screen ${motion}`}>
              <Outlet />
            </div>
          </main>
          {!detail && <AppNav />}
        </div>
        <Toaster position="bottom-center" closeButton offset={detail ? 96 : 104} toastOptions={{ className: '!rounded-2xl !border !border-line !bg-card !text-ink !shadow-pop' }} />
      </BarProvider>
    </PregnancyContext.Provider>
  );
}
