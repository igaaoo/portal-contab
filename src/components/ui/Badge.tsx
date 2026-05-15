import React from 'react';
import { cn } from '@/lib/utils';

type Color = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'gray' | 'accent';

interface BadgeProps {
  color?: Color;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const colorClasses: Record<Color, string> = {
  green: 'bg-[var(--green-bg)] text-[var(--green)]',
  amber: 'bg-[var(--amber-bg)] text-[var(--amber)]',
  red: 'bg-[var(--red-bg)] text-[var(--red)]',
  blue: 'bg-[var(--blue-bg)] text-[var(--blue)]',
  violet: 'bg-[var(--violet-bg)] text-[var(--violet)]',
  gray: 'bg-[var(--bg-sunken)] text-[var(--text-muted)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
};

const dotColors: Record<Color, string> = {
  green: 'bg-[var(--green)]',
  amber: 'bg-[var(--amber)]',
  red: 'bg-[var(--red)]',
  blue: 'bg-[var(--blue)]',
  violet: 'bg-[var(--violet)]',
  gray: 'bg-[var(--text-faint)]',
  accent: 'bg-[var(--accent)]',
};

export function Badge({ color = 'gray', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        colorClasses[color],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[color])} />}
      {children}
    </span>
  );
}
