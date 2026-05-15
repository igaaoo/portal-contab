'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movimentacao, Regra } from '@/types';
import { MOVIMENTACOES, REGRAS } from '@/lib/data';

interface AppContextType {
  cnpjId: string;
  setCnpjId: (id: string) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  movimentacoes: Movimentacao[];
  setMovimentacoes: React.Dispatch<React.SetStateAction<Movimentacao[]>>;
  regras: Regra[];
  setRegras: React.Dispatch<React.SetStateAction<Regra[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cnpjId, setCnpjId] = useState<string>('procare');
  const [dark, setDarkState] = useState<boolean>(false);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(MOVIMENTACOES);
  const [regras, setRegras] = useState<Regra[]>(REGRAS);

  const setDark = (value: boolean) => {
    setDarkState(value);
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('pc_dark');
    if (saved === 'true') setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('pc_dark', String(dark));
  }, [dark]);

  return (
    <AppContext.Provider
      value={{ cnpjId, setCnpjId, dark, setDark, movimentacoes, setMovimentacoes, regras, setRegras }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
