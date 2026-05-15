import React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, required, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
        {label}
        {required && <span className="text-[var(--red)] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--text-faint)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--red)]">{error}</p>}
    </div>
  );
}
