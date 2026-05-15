'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean | 'indeterminate';
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, disabled, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
      disabled={disabled}
      onClick={() => onChange && onChange(checked !== true)}
      className={cn(
        'w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0',
        checked === true || checked === 'indeterminate'
          ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
          : 'border-[var(--line-strong)] hover:border-[var(--accent)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked === true && <Check size={10} strokeWidth={3} />}
      {checked === 'indeterminate' && <Minus size={10} strokeWidth={3} />}
    </button>
  );
}
