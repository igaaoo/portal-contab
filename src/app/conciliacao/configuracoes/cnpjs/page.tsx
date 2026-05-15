'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, AlertCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { AppShell } from '@/components/layout/AppShell';
import { CNPJS, CONTAS_BANCARIAS } from '@/lib/data';
import { Cnpj } from '@/types';
import { useApp } from '@/store/AppContext';

const STATUS_CONFIG = {
  ok: { icon: <CheckCircle2 size={14} />, color: 'green' as const, label: 'OK' },
  warn: { icon: <AlertCircle size={14} />, color: 'amber' as const, label: 'Atenção' },
  err: { icon: <XCircle size={14} />, color: 'red' as const, label: 'Erro' },
};

const EMPTY: Partial<Cnpj> = {
  nomeFantasia: '',
  razao: '',
  cnpj: '',
  tag: '',
  regime: 'Lucro Real',
  status: 'ok',
};

export default function CnpjsPage() {
  const { setCnpjId } = useApp();
  const [cnpjs, setCnpjs] = useState(CNPJS.filter((c) => c.id !== 'geral'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Cnpj>>(EMPTY);
  const [isNew, setIsNew] = useState(true);

  function openNew() {
    setEditing(EMPTY);
    setIsNew(true);
    setModalOpen(true);
  }

  function openEdit(c: Cnpj) {
    setEditing(c);
    setIsNew(false);
    setModalOpen(true);
  }

  function handleSave() {
    if (!editing.nomeFantasia || !editing.tag) return;
    if (isNew) {
      setCnpjs((prev) => [
        ...prev,
        { ...EMPTY, ...editing, id: `cnpj${Date.now()}` } as Cnpj,
      ]);
    } else {
      setCnpjs((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...editing } as Cnpj : c))
      );
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setCnpjs((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <AppShell title="CNPJs">
      <div className="p-5 space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">CNPJs do Grupo</h2>
            <p className="text-sm text-[var(--text-muted)]">{cnpjs.length} empresas cadastradas</p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openNew}>
            Novo CNPJ
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cnpjs.map((cnpj) => {
            const statusInfo = cnpj.status ? STATUS_CONFIG[cnpj.status] : null;
            const contasCnpj = CONTAS_BANCARIAS.filter((c) => c.cnpjId === cnpj.id);
            const saldoTotal = contasCnpj.reduce((s, c) => s + c.saldo, 0);

            return (
              <div
                key={cnpj.id}
                className="bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl p-5 hover:border-[var(--line-strong)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {cnpj.tag.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text)]">{cnpj.nomeFantasia}</div>
                      <div className="text-xs text-[var(--text-faint)] font-mono">{cnpj.tag}</div>
                    </div>
                  </div>
                  {statusInfo && (
                    <Badge color={statusInfo.color}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs text-[var(--text-faint)] leading-relaxed">{cnpj.razao}</div>
                  {cnpj.cnpj && (
                    <div className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-sunken)] px-2 py-1 rounded">
                      {cnpj.cnpj}
                    </div>
                  )}
                  {cnpj.regime && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-faint)]">Regime:</span>
                      <Badge color="blue">{cnpj.regime}</Badge>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 border-t border-[var(--line)]">
                  <div>
                    <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wide mb-0.5">Contas</div>
                    <div className="text-sm font-semibold text-[var(--text)]">{contasCnpj.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wide mb-0.5">Saldo</div>
                    <div className="text-sm font-semibold text-[var(--text)]">
                      R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="xs"
                    className="flex-1"
                    onClick={() => { setCnpjId(cnpj.id); }}
                  >
                    Selecionar
                  </Button>
                  <button
                    onClick={() => openEdit(cnpj)}
                    className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--accent)] cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cnpj.id)}
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
            className="border-2 border-dashed border-[var(--line-strong)] rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer min-h-48"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-sunken)] flex items-center justify-center text-[var(--accent)]">
              <Plus size={20} />
            </div>
            <span className="text-sm text-[var(--text-muted)]">Adicionar empresa</span>
          </button>
        </div>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isNew ? 'Novo CNPJ' : 'Editar CNPJ'}
          footer={
            <>
              <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="md" onClick={handleSave}>Salvar</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Nome Fantasia" required>
              <Input
                value={editing.nomeFantasia || ''}
                onChange={(e) => setEditing({ ...editing, nomeFantasia: e.target.value })}
                placeholder="Ex: Procare Serviços"
              />
            </Field>
            <Field label="Razão Social">
              <Input
                value={editing.razao || ''}
                onChange={(e) => setEditing({ ...editing, razao: e.target.value })}
                placeholder="PROCARE SERVIÇOS LTDA"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tag" required>
                <Input
                  value={editing.tag || ''}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value.toUpperCase() })}
                  placeholder="PRC"
                  className="uppercase"
                />
              </Field>
              <Field label="CNPJ">
                <Input
                  value={editing.cnpj || ''}
                  onChange={(e) => setEditing({ ...editing, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="font-mono"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Regime Tributário">
                <Select
                  value={editing.regime || 'Lucro Real'}
                  onChange={(e) => setEditing({ ...editing, regime: e.target.value })}
                >
                  <option value="Lucro Real">Lucro Real</option>
                  <option value="Lucro Presumido">Lucro Presumido</option>
                  <option value="Simples Nacional">Simples Nacional</option>
                  <option value="MEI">MEI</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={editing.status || 'ok'}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as Cnpj['status'] })}
                >
                  <option value="ok">OK</option>
                  <option value="warn">Atenção</option>
                  <option value="err">Erro</option>
                </Select>
              </Field>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
