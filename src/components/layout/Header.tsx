'use client';

import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { CnpjSelector } from './CnpjSelector';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { dark, setDark } = useApp();
  return (
    <header className="h-14 border-b border-[var(--line)] bg-[var(--bg-elev)] flex items-center gap-3 px-4 shrink-0">
      {title && (
        <h1 className="text-sm font-semibold text-[var(--text)] mr-2">{title}</h1>
      )}
      <div className="flex-1" />
      <CnpjSelector />
      <button className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors cursor-pointer relative">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
      </button>
      <button
        onClick={() => setDark(!dark)}
        className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors cursor-pointer"
        title="Alternar tema"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
