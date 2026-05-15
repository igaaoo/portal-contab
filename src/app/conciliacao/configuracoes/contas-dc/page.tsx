'use client';

import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppShell } from '@/components/layout/AppShell';
import { CONTAS_CONTABEIS } from '@/lib/data';
import { ContaContabil } from '@/types';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'debito', label: 'Débito' },
  { id: 'credito', label: 'Crédito' },
];

const EMPTY: Partial<ContaContabil> = {
  codigo: '',
  nome: '',
  natureza: 'debito',
  tipo: '',
  cnpjId: '*',
  ativo: true,
};

export default function ContasDCPage() {
  const [contas, setContas] = useState(CONTAS_CONTABEIS);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ContaContabil>>(EMPTY);
  const [isNew, setIsNew] = useState(true);

  const filtered = contas.filter((c) => {
    const matchesTab = tab === 'all' || c.natureza === tab;
    const matchesSearch =
      !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.codigo.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  function openNew() {
    setEditing(EMPTY);
    setIsNew(true);
    setModalOpen(true);
  }

  function openEdit(c: ContaContabil) {
    setEditing(c);
    setIsNew(false);
    setModalOpen(true);
  }

  function handleSave() {
    if (!editing.nome || !editing.codigo) return;
    if (isNew) {
      setContas((prev) => [
        ...prev,
        { ...EMPTY, ...editing, id: `cc${Date.now()}` } as ContaContabil,
      ]);
    } else {
      setContas((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...editing } as ContaContabil : c))
      );
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setContas((prev) => prev.filter((c) => c.id !== id));
  }

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.id === 'all' ? contas.length : contas.filter((c) => c.natureza === t.id).length,
  }));

  return (
    <AppShell title="Contas D/C">
      <div className="p-5 space-y-4 ">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Contas Débito/Crédito</h2>
            <p className="text-sm text-[var(--text-muted)]">Plano de contas contábeis</p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openNew}>
            Nova Conta
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Tabs tabs={tabsWithCounts} active={tab} onChange={setTab} />
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <Input
              placeholder="Buscar conta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 w-56"
            />
          </div>
        </div>

        <div className="bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={<BookOpen size={20} />} title="Nenhuma conta" description="Crie a primeira conta do plano" action={<Button variant="primary" size="sm" onClick={openNew}>Nova Conta</Button>} />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--bg-sunken)]">
                <tr>
                  {['Código', 'Nome', 'Natureza', 'Tipo', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((conta) => (
                  <tr key={conta.id} className={cn('border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors', !conta.ativo && 'opacity-50')}>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--accent)] font-medium">
                      {conta.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text)]">{conta.nome}</td>
                    <td className="px-4 py-3">
                      <Badge color={conta.natureza === 'debito' ? 'red' : 'green'}>
                        {conta.natureza === 'debito' ? 'Débito' : 'Crédito'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{conta.tipo}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium', conta.ativo ? 'text-[var(--green)]' : 'text-[var(--text-faint)]')}>
                        {conta.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(conta)} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--accent)] cursor-pointer transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(conta.id)} className="p-1.5 rounded hover:bg-[var(--red-bg)] text-[var(--text-faint)] hover:text-[var(--red)] cursor-pointer transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isNew ? 'Nova Conta' : 'Editar Conta'}
          footer={
            <>
              <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="md" onClick={handleSave}>Salvar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Código" required>
                <Input
                  value={editing.codigo || ''}
                  onChange={(e) => setEditing({ ...editing, codigo: e.target.value })}
                  placeholder="Ex: 4.1.1.02"
                  className="font-mono"
                />
              </Field>
              <Field label="Natureza">
                <Select
                  value={editing.natureza}
                  onChange={(e) => setEditing({ ...editing, natureza: e.target.value as ContaContabil['natureza'] })}
                >
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                </Select>
              </Field>
            </div>
            <Field label="Nome" required>
              <Input
                value={editing.nome || ''}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                placeholder="Ex: Despesas com Aluguel"
              />
            </Field>
            <Field label="Tipo">
              <Input
                value={editing.tipo || ''}
                onChange={(e) => setEditing({ ...editing, tipo: e.target.value })}
                placeholder="Ex: Despesa Operacional"
              />
            </Field>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
