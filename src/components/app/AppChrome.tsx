import { ArrowLeft, Home, PersonStanding, Search, Settings, ShieldAlert, type LucideIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV } from '../../data/nav';
import EaseLogo from '../EaseLogo';
import Chip from '../ui/Chip';
import ThemeToggle from '../ThemeToggle';
import { BarContext, isDetail, useAppBar, useBack, type BarConfig } from './barContext';
import type { PregnancyStatus } from '../../hooks/usePregnancyStatus';

export function BarProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BarConfig | null>(null);
  const set = useCallback((c: BarConfig | null) => setConfig(c), []);
  const value = useMemo(() => ({ set, config }), [set, config]);
  return <BarContext.Provider value={value}>{children}</BarContext.Provider>;
}

const TAB_TITLES: Record<string, string> = {
  '/map': 'Where does it hurt?',
  '/points': 'All points',
  '/settings': 'Settings',
};

/** Top app bar: logo on Home, a title on the other tabs, a back arrow (and a title that fades in on scroll) on detail screens. */
export function AppBar({ status }: { status: PregnancyStatus }) {
  const { pathname } = useLocation();
  const { config } = useContext(BarContext);
  const goBack = useBack();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const detail = isDetail(pathname);
  const title = TAB_TITLES[pathname];
  const lifted = scrollY > 4;

  return (
    <header className={`sticky top-0 z-20 border-b bg-paper transition-colors ${lifted ? 'border-line' : 'border-transparent'}`}>
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-1 px-2">
        {detail ? (
          <>
            <button type="button" aria-label="Back" onClick={() => goBack(config?.backTo ?? '/')} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink">
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
            <p aria-hidden="true" className={`min-w-0 flex-1 truncate text-[17px] font-bold tracking-tight transition-opacity duration-150 ${config?.pinned || scrollY > 90 ? 'opacity-100' : 'opacity-0'}`}>
              {config?.title}
            </p>
          </>
        ) : pathname === '/' ? (
          <Link to="/" aria-label="Ease home" className="flex min-h-12 items-center rounded-full px-2">
            <EaseLogo height={24} ink="var(--ink)" dot="var(--accent)" />
          </Link>
        ) : (
          <p aria-hidden="true" className="min-w-0 flex-1 truncate px-2 text-[22px] font-extrabold tracking-tight">{title}</p>
        )}
        {!detail && (
          <div className="ml-auto flex shrink-0 items-center gap-1 pr-1">
            {status === 'yes' && (
              <Link to="/settings#pregnancy" aria-label="Pregnancy mode is on. Open settings">
                <Chip tone="caution" icon={ShieldAlert}>Pregnancy mode</Chip>
              </Link>
            )}
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}

const ICONS: Record<string, LucideIcon> = { '/': Home, '/map': PersonStanding, '/points': Search, '/settings': Settings };

/** Material-style navigation bar (bottom on phones, a rail on tablets and in landscape). */
export function AppNav() {
  const { pathname, state } = useLocation();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] wide:inset-y-0 wide:left-0 wide:right-auto wide:flex wide:w-20 wide:items-start wide:border-r wide:border-t-0 wide:pb-0 wide:pt-4">
      <ul className="mx-auto grid h-20 max-w-md grid-cols-4 wide:flex wide:h-auto wide:max-w-none wide:flex-col wide:gap-2">
        {NAV.map(({ to, label, match }) => {
          const active = match(pathname, state as Parameters<typeof match>[1]);
          const Icon = ICONS[to];
          return (
            <li key={to} className="min-w-0">
              <Link to={to} aria-current={active ? 'page' : undefined} className="flex h-20 min-w-0 flex-col items-center justify-center gap-1 wide:w-20">
                <span className={`flex h-8 w-16 max-w-full items-center justify-center rounded-full transition-colors duration-200 ${active ? 'bg-accent-tint text-accent-strong' : 'text-ink-2'}`}>
                  <Icon size={24} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
                </span>
                <span className={`max-w-full truncate px-0.5 text-xs tracking-wide ${active ? 'font-extrabold text-ink' : 'font-semibold text-ink-2'}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Put on a detail screen to give the app bar its title and back target. Renders nothing. */
export function AppBarTitle({ title, backTo, pinned }: { title: string; backTo: string; pinned?: boolean }) {
  useAppBar(title, backTo, pinned);
  return null;
}
