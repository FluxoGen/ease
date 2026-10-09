import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV, type NavState } from '../data/nav';

/** Phone tab bar. The clay dot above the active icon is the logo's acupoint. */
export default function BottomNav() {
  const { pathname, state } = useLocation();

  // Tuck the tab bar away while reading down a page; bring it back on scroll up. The floating
  // press bar on point pages follows it (see .pressbar in index.css).
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - last;
      if (Math.abs(dy) < 8) return;
      document.documentElement.dataset.nav = y > 140 && dy > 0 ? 'hidden' : 'shown';
      last = y;
    };
    document.documentElement.dataset.nav = 'shown';
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <nav
      aria-label="Main"
      className="tabbar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/97 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname, state as NavState | null);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${active ? 'text-ink' : 'text-ink-2'}`}
              >
                <span
                  className={`absolute top-1 h-1.5 w-1.5 rounded-full bg-accent transition ${active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                />
                <Icon size={22} strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" className="mt-1.5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
