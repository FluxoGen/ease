import { createContext, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** What a detail screen tells the app bar: a title that appears once you scroll, and where "back" goes if there is no history. */
export interface BarConfig { title: string; backTo: string }

export const BarContext = createContext<{ set: (c: BarConfig | null) => void; config: BarConfig | null }>({ set: () => {}, config: null });

/** Called by detail screens (point, routine). A no-op on the website. */
export function useAppBar(title: string | undefined, backTo: string) {
  const { set } = useContext(BarContext);
  useEffect(() => {
    if (title) set({ title, backTo });
    return () => set(null);
  }, [set, title, backTo]);
}

export const isDetail = (pathname: string) => pathname.startsWith('/point/') || pathname.startsWith('/routine/');

/** Back like the system back: previous screen if there is one, else the screen it logically belongs under. */
export function useBack() {
  const navigate = useNavigate();
  return useCallback((fallback: string) => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1); else navigate(fallback, { replace: true });
  }, [navigate]);
}
