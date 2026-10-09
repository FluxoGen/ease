import { Home, PersonStanding, Search, Settings, type LucideIcon } from 'lucide-react';

export interface NavState { fromAllPoints?: boolean; fromRoutine?: string; fromHome?: boolean }

/** A point page belongs to the tab the user came from, not always to Search. */
const fromList = (p: string, s: NavState | null) => p.startsWith('/point/') && Boolean(s?.fromAllPoints);

export const NAV: Array<{ to: string; label: string; icon: LucideIcon; match: (p: string, s: NavState | null) => boolean }> = [
  { to: '/', label: 'Home', icon: Home, match: (p, s) => p === '/' || p.startsWith('/routine') || (p.startsWith('/point/') && !fromList(p, s)) },
  { to: '/map', label: 'Body', icon: PersonStanding, match: (p) => p.startsWith('/map') },
  { to: '/points', label: 'Search', icon: Search, match: (p, s) => p.startsWith('/points') || fromList(p, s) },
  { to: '/settings', label: 'Settings', icon: Settings, match: (p) => p.startsWith('/settings') || p.startsWith('/safety') || p.startsWith('/about') },
];
