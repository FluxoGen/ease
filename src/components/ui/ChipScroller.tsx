import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ChipScrollerProps {
  label: string;
  children: ReactNode;
  className?: string;
}

const FADE = 28;

/**
 * A horizontal row of chips that behaves like a native slider:
 * - snaps to chips instead of stopping half-way through one
 * - fades the edge that has more content (no hard clipped chip)
 * - keeps the selected chip (aria-pressed) in view, e.g. when you arrive with ?area=foot
 * - contains horizontal overscroll so an edge swipe doesn't trigger the browser's back gesture
 * - shows arrow buttons for mouse users (hover devices), who have no horizontal wheel
 * On wide screens the chips simply wrap and none of this is needed.
 */
export default function ChipScroller({ label, children, className = '' }: ChipScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
  };

  // Measure on size changes (the observer also fires once on attach).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Bring the selected chip into view, but only when the SELECTION changes (or on arrival). Running this on
  // every render would pull the row back whenever you scroll away from the selected chip.
  const revealed = useRef<Element | null>(null);
  useEffect(() => {
    const el = ref.current;
    const active = el?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? null;
    if (!el || !active || active === revealed.current) return;
    revealed.current = active;
    if (el.scrollWidth <= el.clientWidth) return;
    const row = el.getBoundingClientRect();
    const chip = active.getBoundingClientRect();
    if (chip.left >= row.left && chip.right <= row.right) return; // already fully visible
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  });

  const nudge = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: 'smooth' });
  // Only mask when there is more to scroll to; otherwise leave the row untouched.
  const mask = more.left || more.right
    ? `linear-gradient(to right, transparent 0, #000 ${more.left ? FADE : 0}px, #000 calc(100% - ${more.right ? FADE : 0}px), transparent 100%)`
    : undefined;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={ref}
        role="group"
        aria-label={label}
        onScroll={measure}
        style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
        className="no-scrollbar -mx-4 flex snap-x snap-proximity scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 md:mx-0 md:flex-wrap md:snap-none md:overflow-visible md:px-0"
      >
        {children}
      </div>
      {more.left && (
        <button type="button" aria-label="Scroll left" onClick={() => nudge(-1)} className="absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-card text-ink shadow-card [@media(hover:hover)]:flex md:hidden">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      )}
      {more.right && (
        <button type="button" aria-label="Scroll right" onClick={() => nudge(1)} className="absolute right-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-card text-ink shadow-card [@media(hover:hover)]:flex md:hidden">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
