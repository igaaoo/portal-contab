'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  side?: 'right' | 'left';
}

const widthClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[540px]',
};

export function Drawer({ open, onClose, title, children, width = 'md', side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute top-0 bottom-0 bg-[var(--bg-elev)] border-[var(--line)] shadow-2xl flex flex-col',
          widthClasses[width],
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r'
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)] shrink-0">
            <h2 className="font-semibold text-[var(--text)]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
