import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';
import { STATUS_LABELS } from '@/src/lib/orderRules';
import type { OrderStatus } from '@/src/lib/orderRules';

const labelClass = 'text-sm font-semibold text-brand-ink/70 ml-1';
const inputClass =
  'w-full px-4 py-3 rounded-xl border border-brand-beige bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all disabled:bg-brand-beige/60 disabled:text-brand-ink/50';

interface FieldShellProps {
  label: string;
  fieldId?: string;
  name?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ label, fieldId, name, error, hint, children }: FieldShellProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-brand-ink/50 ml-1">{hint}</p>}
      {error && (
        <p role="alert" data-testid={`error-${name}`} className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, id, className, ...props }: FieldProps & ComponentProps<'input'>) {
  const fieldId = id ?? props.name;

  return (
    <FieldShell label={label} fieldId={fieldId} name={props.name} error={error} hint={hint}>
      <input id={fieldId} aria-invalid={Boolean(error)} className={cn(inputClass, className)} {...props} />
    </FieldShell>
  );
}

export function SelectField({ label, error, hint, id, className, children, ...props }: FieldProps & ComponentProps<'select'>) {
  const fieldId = id ?? props.name;

  return (
    <FieldShell label={label} fieldId={fieldId} name={props.name} error={error} hint={hint}>
      <select id={fieldId} aria-invalid={Boolean(error)} className={cn(inputClass, className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({ label, error, hint, id, className, ...props }: FieldProps & ComponentProps<'textarea'>) {
  const fieldId = id ?? props.name;

  return (
    <FieldShell label={label} fieldId={fieldId} name={props.name} error={error} hint={hint}>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(inputClass, 'resize-none', className)}
        {...props}
      />
    </FieldShell>
  );
}

const alertTones = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-brand-gold/30 bg-brand-pastel text-brand-ink/80',
};

interface AlertProps {
  tone: keyof typeof alertTones;
  testId?: string;
  children: ReactNode;
}

export function Alert({ tone, testId, children }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      data-testid={testId ?? `alert-${tone}`}
      className={cn('rounded-xl border px-4 py-3 text-sm', alertTones[tone])}
    >
      {children}
    </div>
  );
}

const statusTones: Record<OrderStatus, string> = {
  MENUNGGU_PEMBAYARAN: 'bg-amber-100 text-amber-800',
  MENUNGGU_VERIFIKASI: 'bg-sky-100 text-sky-800',
  DIPROSES: 'bg-violet-100 text-violet-800',
  SELESAI: 'bg-emerald-100 text-emerald-800',
  DIBATALKAN: 'bg-stone-200 text-stone-700',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      data-testid="order-status"
      className={cn('inline-flex rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap', statusTones[status])}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
