interface DotRingsProps {
  size?: number;
  className?: string;
  /** Pulse the outer ring (used for live/active states). */
  pulse?: boolean;
  /** Rings only, no clay dot: a quiet watermark. */
  quiet?: boolean;
}

/** The logo's acupoint: a clay dot inside two quiet rings. */
export default function DotRings({ size = 24, className, pulse, quiet }: DotRingsProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke="var(--ink)" strokeWidth="1.6" opacity="0.18" />
      <circle cx="32" cy="32" r="19" fill="none" stroke="var(--ink)" strokeWidth="2" opacity="0.32" />
      {pulse && (
        <circle
          cx="32" cy="32" r="12" fill="var(--accent)" opacity="0.35"
          style={{ transformOrigin: '32px 32px', animation: 'ease-ring 2.4s ease-out infinite' }}
        />
      )}
      {!quiet && <circle cx="32" cy="32" r="9" fill="var(--accent)" />}
    </svg>
  );
}
