import { Moon, Sun } from 'lucide-react';
import { setThemePref, useTheme } from '../theme';

/** One tap between light and dark (the full choice, including "System", is on the Safety screen). */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { dark } = useTheme();
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setThemePref(dark ? 'light' : 'dark', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-ink-2 hover:bg-card-2 hover:text-ink ${className}`}
    >
      <Icon size={22} aria-hidden="true" />
    </button>
  );
}
