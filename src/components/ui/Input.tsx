import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, className, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={cn(
            'w-full h-8 rounded-md border bg-[var(--bg-elev)] text-[var(--text)] text-sm',
            'px-3 transition-colors outline-none',
            'border-[var(--line)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
            'placeholder:text-[var(--text-faint)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]',
            !!icon && 'pl-8',
            className
          )}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        {...props}
        className={cn(
          'w-full h-8 rounded-md border bg-[var(--bg-elev)] text-[var(--text)] text-sm',
          'px-3 transition-colors outline-none cursor-pointer',
          'border-[var(--line)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]',
          error && 'border-[var(--red)]',
          className
        )}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
