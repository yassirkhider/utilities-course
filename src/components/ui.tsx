import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Loader2, Inbox, AlertTriangle } from 'lucide-react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary: 'bg-teal-accent-500 text-white hover:bg-teal-accent-600 focus-visible:ring-teal-accent-500',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-500',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-brand-500',
  danger: 'bg-safety-red text-white hover:bg-red-700 focus-visible:ring-red-500',
};

const SIZE_CLASSES = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({ className = '', children }: { className?: string; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
      <Loader2 className="animate-spin" size={32} aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ label = 'Nothing here yet', hint }: { label?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400 text-center">
      <Inbox size={36} aria-hidden="true" />
      <p className="font-medium text-slate-500">{label}</p>
      {hint && <p className="text-sm max-w-sm">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <AlertTriangle size={36} className="text-safety-amber" aria-hidden="true" />
      <p className="text-slate-600 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-teal-accent-600 mb-1">{eyebrow}</p>}
      <h2 className="text-2xl md:text-3xl font-bold text-navy-900">{title}</h2>
      {subtitle && <p className="text-slate-600 mt-1.5 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
