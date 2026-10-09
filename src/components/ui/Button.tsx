import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent-strong text-on-accent shadow-card hover:brightness-110',
  secondary: 'border border-line-strong bg-card text-ink hover:bg-card-2',
  ghost: 'text-accent-strong hover:bg-accent-tint',
};

const BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-[15px] font-bold transition active:scale-[0.98] disabled:opacity-50';

interface Common {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Button({ variant = 'primary', className = '', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest} />;
}

export function LinkButton({
  variant = 'primary', className = '', to, state, children,
}: Common & { to: string; state?: unknown }) {
  return (
    <Link to={to} state={state} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
