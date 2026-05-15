'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { CNPJS } from '@/lib/data';
import { cn } from '@/lib/utils';

const statusIcons = {
  ok: <CheckCircle2 size={12} className="text-[var(--green)]" />,
  warn: <AlertCircle size={12} className="text-[var(--amber)]" />,
  err: <XCircle size={12} className="text-[var(--red)]" />,
};

export function CnpjSelector() {
  const { cnpjId, setCnpjId } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = CNPJS.find((c) => c.id === cnpjId) || CNPJS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-8 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg-elev)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
      >
        <Building2 size={14} className="text-[var(--accent)] shrink-0" />
        <span className="text-sm font-medium text-[var(--text)] whitespace-nowrap flex-1 text-left">
          {selected.nomeFantasia}
        </span>
        <span className="text-xs text-[var(--text-faint)] bg-[var(--bg-sunken)] px-1 rounded shrink-0">
          {selected.tag}
        </span>
        <ChevronDown
          size={12}
          className={cn('text-[var(--text-faint)] shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {CNPJS.map((cnpj) => (
              <button
                key={cnpj.id}
                onClick={() => {
                  setCnpjId(cnpj.id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer',
                  cnpjId === cnpj.id
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                    : 'hover:bg-[var(--bg-hover)]'
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0',
                    cnpjId === cnpj.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-sunken)] text-[var(--text-muted)]'
                  )}
                >
                  {cnpj.tag.slice(0, 2)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text)] truncate">
                    {cnpj.nomeFantasia}
                  </div>
                  <div className="text-xs text-[var(--text-faint)] truncate">
                    {cnpj.cnpj || cnpj.razao}
                  </div>
                </div>
                {cnpj.status && statusIcons[cnpj.status]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
