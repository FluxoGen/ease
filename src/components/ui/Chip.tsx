import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ChipTone = 'neutral' | 'accent' | 'ok' | 'info' | 'caution' | 'stop';

const TONES: Record<ChipTone, string> = {
  neutral: 'bg-card-2 text-ink-2',
  accent: 'bg-accent-tint text-accent-strong',
  ok: 'bg-ok-tint text-ok',
  info: 'bg-info-tint text-info',
  caution: 'bg-caution-tint text-caution border border-caution-line',
  stop: 'bg-stop-tint text-stop border border-stop-line',
};

interface ChipProps {
  tone?: ChipTone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

/** Small status/label pill. Tone is the meaning (see docs/design-system.md), not decoration. */
export default function Chip({ tone = 'neutral', icon: Icon, children, className = '' }: ChipProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  );
}
