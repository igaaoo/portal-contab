'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { AppShell } from '@/components/layout/AppShell';
import { CONTAS_BANCARIAS, BANCOS, CNPJS, fmtMoney } from '@/lib/data';
import { ContaBancaria } from '@/types';
import { cn } from '@/lib/utils';

const EMPTY: Partial<ContaBancaria> = {
  cnpjId: 'procare',
  bancoId: 'itau',
  agencia: '',
  conta: '',
  apelido: '',
  tipo: 'Conta Corrente',
  saldo: 0,
  ativo: true,
};

export default function ContasBancariasPage() {
  const [contas, setContas] = useState(CONTAS_BANCARIAS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ContaBancaria>>(EMPTY);
  const [isNew, setIsNew] = useState(true);

  const saldoTotal = contas.filter((c) => c.ativo).reduce((s, c) => s + c.saldo, 0);

  function openNew() {
    setEditing(EMPTY);
    setIsNew(true);
    setModalOpen(true);
  }

  function openEdit(c: ContaBancaria) {
    setEditing(c);
    setIsNew(false);
    setModalOpen(true);
  }

  function handleSave() {
    if (!editing.apelido || !editing.conta) return;
    if (isNew) {
      setContas((prev) => [
        ...prev,
        { ...EMPTY, ...editing, id: `cb${Date.now()}` } as ContaBancaria,
      ]);
    } else {
      setContas((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...editing } as ContaBancaria : c))
      );
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setContas((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleAtivo(id: string) {
    setContas((prev) => prev.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c)));
  }

  return (
    <AppShell title="Contas Bancárias">
      <div className="p-5 space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Contas Bancárias</h2>
            <p className="text-sm text-[var(--text-muted)]">
              {contas.filter((c) => c.ativo).length} ativas — Saldo total: R$ {fmtMoney(saldoTotal)}
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openNew}>
            Nova Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contas.map((conta) => {
            const banco = BANCOS.find((b) => b.id === conta.bancoId);
            const cnpjInfo = CNPJS.find((c) => c.id === conta.cnpjId);

            return (
              <div
                key={conta.id}
                className={cn(
                  'bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl p-5 hover:border-[var(--line-strong)] transition-colors',
                  !conta.ativo && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: banco?.cor || '#888' }}
                    >
                      {banco?.codigo}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text)]">{conta.apelido}</div>
                      <div className="text-xs text-[var(--text-faint)]">{banco?.nome}</div>
                    </div>
                  </div>
                  <Badge color={conta.ativo ? 'green' : 'gray'}>
                    {conta.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-faint)]">Agência</span>
                    <span className="font-mono text-[var(--text-muted)]">{conta.agencia}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-faint)]">Conta</span>
                    <span className="font-mono text-[var(--text-muted)]">{conta.conta}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-faint)]">Tipo</span>
                    <span className="text-[var(--text-muted)]">{conta.tipo}</span>
                  </div>
                  {cnpjInfo && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-faint)]">Empresa</span>
                      <Badge color="accent">{cnpjInfo.tag}</Badge>
                    </div>
                  )}
                </div>

                <div className="bg-[var(--bg-sunken)] rounded-lg p-3 mb-4">
                  <div className="text-xs text-[var(--text-faint)] mb-0.5">Saldo atual</div>
                  <div className="text-xl font-bold text-[var(--text)]">R$ {fmtMoney(conta.saldo)}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-[var(--green)]">
                    <TrendingUp size={11} />
                    <span>Atualizado hoje</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    className="flex-1"
                    onClick={() => toggleAtivo(conta.id)}
                  >
                    {conta.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                  <button
                    onClick={() => openEdit(conta)}
                    className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--accent)] cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(conta.id)}
                    className="p-1.5 rounded hover:bg-[var(--red-bg)] text-[var(--text-faint)] hover:text-[var(--red)] cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={openNew}
            className="border-2 border-dashed border-[var(--line-strong)] rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer min-h-60"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-sunken)] flex items-center justify-center text-[var(--accent)]">
              <Plus size={20} />
            </div>
            <span className="text-sm text-[var(--text-muted)]">Adicionar conta</span>
          </button>
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isNew ? 'Nova Conta Bancária' : 'Editar Conta Bancária'}
          footer={
            <>
              <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="md" onClick={handleSave}>Salvar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Apelido" required>
              <Input
                value={editing.apelido || ''}
                onChange={(e) => setEditing({ ...editing, apelido: e.target.value })}
                placeholder="Ex: Itaú — Movimento"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Banco">
                <Select
                  value={editing.bancoId}
                  onChange={(e) => setEditing({ ...editing, bancoId: e.target.value })}
                >
                  {BANCOS.map((b) => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Empresa">
                <Select
                  value={editing.cnpjId}
                  onChange={(e) => setEditing({ ...editing, cnpjId: e.target.value })}
                >
                  {CNPJS.filter((c) => c.id !== 'geral').map((c) => (
                    <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Agência">
                <Input
                  value={editing.agencia || ''}
                  onChange={(e) => setEditing({ ...editing, agencia: e.target.value })}
                  placeholder="0145"
                  className="font-mono"
                />
              </Field>
              <Field label="Conta" required>
                <Input
                  value={editing.conta || ''}
                  onChange={(e) => setEditing({ ...editing, conta: e.target.value })}
                  placeholder="12345-6"
                  className="font-mono"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo">
                <Select
                  value={editing.tipo}
                  onChange={(e) => setEditing({ ...editing, tipo: e.target.value })}
                >
                  <option>Conta Corrente</option>
                  <option>Conta Poupança</option>
                  <option>Conta Investimento</option>
                  <option>Conta Salário</option>
                </Select>
              </Field>
              <Field label="Saldo Inicial (R$)">
                <Input
                  type="number"
                  value={editing.saldo ?? 0}
                  onChange={(e) => setEditing({ ...editing, saldo: Number(e.target.value) })}
                  step="0.01"
                />
              </Field>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
