import React from 'react';
import { BANCOS } from '@/lib/data';

interface BankPillProps {
  bancoId: string;
  showName?: boolean;
}

export function BankPill({ bancoId, showName }: BankPillProps) {
  const banco = BANCOS.find((b) => b.id === bancoId);
  if (!banco) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-md text-white text-[10px] font-bold shrink-0"
        style={{ backgroundColor: banco.cor }}
      >
        {banco.codigo}
      </span>
      {showName && <span className="text-xs text-[var(--text-muted)]">{banco.nome}</span>}
    </span>
  );
}
