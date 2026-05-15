import React from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceProps {
  value: number; // 0-100
  className?: string;
}

export function Confidence({ value, className }: ConfidenceProps) {
  const color =
    value >= 90
      ? 'bg-[var(--green)]'
      : value >= 70
        ? 'bg-[var(--amber)]'
        : 'bg-[var(--red)]';
  const textColor =
    value >= 90
      ? 'text-[var(--green)]'
      : value >= 70
        ? 'text-[var(--amber)]'
        : 'text-[var(--red)]';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="w-12 h-1.5 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('text-xs font-medium tabular-nums', textColor)}>{value}%</span>
    </div>
  );
}
