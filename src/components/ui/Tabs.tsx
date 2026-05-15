'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex gap-0.5 bg-[var(--bg-sunken)] p-0.5 rounded-lg',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer',
            active === tab.id
              ? 'bg-[var(--bg-elev)] text-[var(--text)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                active === tab.id
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'bg-[var(--bg-hover)] text-[var(--text-faint)]'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
