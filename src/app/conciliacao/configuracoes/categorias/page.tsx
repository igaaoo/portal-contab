'use client';

import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppShell } from '@/components/layout/AppShell';
import { CATEGORIAS, CONTAS_CONTABEIS } from '@/lib/data';
import { Categoria } from '@/types';
import { cn } from '@/lib/utils';

const TIPO_LABELS: Record<string, { label: string; color: 'red' | 'green' | 'amber' | 'blue' | 'violet' | 'gray' }> = {
  despesa: { label: 'Despesa', color: 'red' },
  receita: { label: 'Receita', color: 'green' },
  imposto: { label: 'Imposto', color: 'amber' },
  transferencia: { label: 'Transferência', color: 'blue' },
  ajuste: { label: 'Ajuste', color: 'violet' },
  outro: { label: 'Outro', color: 'gray' },
};

const EMPTY_CAT: Partial<Categoria> = {
  nome: '',
  tipo: 'despesa',
  cnpjId: '*',
  contaDebId: '',
  contaCredId: '',
  ativo: true,
};

export default function CategoriasPage() {
  const [cats, setCats] = useState(CATEGORIAS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Categoria>>(EMPTY_CAT);
  const [isNew, setIsNew] = useState(true);

  const filtered = cats.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.tipo.includes(search.toLowerCase())
  );

  function openNew() {
    setEditing(EMPTY_CAT);
    setIsNew(true);
    setModalOpen(true);
  }

  function openEdit(cat: Categoria) {
    setEditing(cat);
    setIsNew(false);
    setModalOpen(true);
  }

  function handleSave() {
    if (!editing.nome) return;
    if (isNew) {
      setCats((prev) => [
        ...prev,
        { ...EMPTY_CAT, ...editing, id: `c${Date.now()}`, ops: 0 } as Categoria,
      ]);
    } else {
      setCats((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...editing } as Categoria : c)));
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setCats((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleAtivo(id: string) {
    setCats((prev) => prev.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c)));
  }

  return (
    <AppShell title="Categorias">
      <div className="p-5 space-y-4 ">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Categorias</h2>
            <p className="text-sm text-[var(--text-muted)]">{cats.filter((c) => c.ativo).length} ativas de {cats.length}</p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openNew}>
            Nova Categoria
          </Button>
        </div>

        <div className="relative w-72">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <Input
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
        </div>

        <div className="bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={<Tag size={20} />} title="Nenhuma categoria" description="Crie sua primeira categoria" action={<Button variant="primary" size="sm" onClick={openNew}>Nova Categoria</Button>} />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--bg-sunken)]">
                <tr>
                  {['Nome', 'Tipo', 'Conta Débito', 'Conta Crédito', 'Ops', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => {
                  const tipoInfo = TIPO_LABELS[cat.tipo];
                  const contaDeb = CONTAS_CONTABEIS.find((c) => c.id === cat.contaDebId);
                  const contaCred = CONTAS_CONTABEIS.find((c) => c.id === cat.contaCredId);
                  return (
                    <tr
                      key={cat.id}
                      className={cn(
                        'border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors',
                        !cat.ativo && 'opacity-50'
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text)]">{cat.nome}</td>
                      <td className="px-4 py-3">
                        <Badge color={tipoInfo.color}>{tipoInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {contaDeb ? (
                          <span className="font-mono">{contaDeb.codigo}</span>
                        ) : <span className="text-[var(--text-faint)]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {contaCred ? (
                          <span className="font-mono">{contaCred.codigo}</span>
                        ) : <span className="text-[var(--text-faint)]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)] tabular-nums">{cat.ops}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAtivo(cat.id)}
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors',
                            cat.ativo
                              ? 'bg-[var(--green-bg)] text-[var(--green)] hover:opacity-80'
                              : 'bg-[var(--bg-sunken)] text-[var(--text-faint)] hover:opacity-80'
                          )}
                        >
                          {cat.ativo ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded hover:bg-[var(--red-bg)] text-[var(--text-faint)] hover:text-[var(--red)] cursor-pointer transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isNew ? 'Nova Categoria' : 'Editar Categoria'}
          footer={
            <>
              <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="md" onClick={handleSave}>Salvar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Nome" required>
              <Input
                value={editing.nome || ''}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                placeholder="Ex: Aluguel, Folha de Pagamento..."
              />
            </Field>
            <Field label="Tipo">
              <Select
                value={editing.tipo}
                onChange={(e) => setEditing({ ...editing, tipo: e.target.value as Categoria['tipo'] })}
              >
                {Object.entries(TIPO_LABELS).map(([k, { label }]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Conta Débito">
                <Select
                  value={editing.contaDebId}
                  onChange={(e) => setEditing({ ...editing, contaDebId: e.target.value })}
                >
                  <option value="">— Selecionar —</option>
                  {CONTAS_CONTABEIS.filter((c) => c.natureza === 'debito').map((c) => (
                    <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Conta Crédito">
                <Select
                  value={editing.contaCredId}
                  onChange={(e) => setEditing({ ...editing, contaCredId: e.target.value })}
                >
                  <option value="">— Selecionar —</option>
                  {CONTAS_CONTABEIS.filter((c) => c.natureza === 'credito').map((c) => (
                    <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
