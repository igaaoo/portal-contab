import React from 'react';
import { cn } from '@/lib/utils';

interface KPIProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function KPI({ label, value, sub, trend, trendValue, icon, accent, className }: KPIProps) {
  const trendColor =
    trend === 'up' ? 'text-[var(--green)]' : trend === 'down' ? 'text-[var(--red)]' : 'text-[var(--text-muted)]';

  return (
    <div
      className={cn(
        'bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl p-4 flex flex-col gap-1',
        accent && 'border-[var(--accent-soft)] bg-[var(--accent-soft)]/20',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="text-[var(--accent)] opacity-70">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-[var(--text)] leading-tight">{value}</div>
      {(sub || trendValue) && (
        <div className="flex items-center gap-2 text-xs">
          {trendValue && (
            <span className={cn('font-medium', trendColor)}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
            </span>
          )}
          {sub && <span className="text-[var(--text-faint)]">{sub}</span>}
        </div>
      )}
    </div>
  );
}
