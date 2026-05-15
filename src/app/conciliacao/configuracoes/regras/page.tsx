'use client';

import React, { useMemo, useState } from 'react';
import { Check, Eye, Pencil, Plus, Search, Sparkles, Trash2, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Confidence } from '@/components/ui/Confidence';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/store/AppContext';
import {
  CATEGORIAS,
  CNPJS,
  CONTAS_CONTABEIS,
  MOVIMENTACOES,
} from '@/lib/data';
import { Regra } from '@/types';
import { cn } from '@/lib/utils';

const EMPTY: Partial<Regra> = {
  nome: '',
  cnpjId: '*',
  keywords: [],
  tipoMov: 'debito',
  valorMin: 0,
  valorMax: null,
  categoriaId: '',
  confianca: 85,
  ativo: true,
};

function fmtMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function RegrasPage() {
  const { regras, setRegras } = useApp();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Regra>>(EMPTY);
  const [isNew, setIsNew] = useState(true);

  const filtered = regras.filter(
    (r) =>
      r.nome.toLowerCase().includes(search.toLowerCase()) ||
      r.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))
  );

  function openNew() {
    setEditing({ ...EMPTY, keywords: [] });
    setIsNew(true);
    setDrawerOpen(true);
  }

  function openEdit(r: Regra) {
    setEditing({ ...r, keywords: [...r.keywords] });
    setIsNew(false);
    setDrawerOpen(true);
  }

  function handleSave() {
    const hasRequiredFields =
      Boolean(editing.nome?.trim()) &&
      Boolean(editing.categoriaId) &&
      Boolean(editing.keywords?.length);

    if (!hasRequiredFields) return;

    if (isNew) {
      setRegras((prev) => [
        { ...EMPTY, ...editing, id: `r${Date.now()}`, hits: 0 } as Regra,
        ...prev,
      ]);
    } else {
      setRegras((prev) =>
        prev.map((r) => (r.id === editing.id ? ({ ...r, ...editing } as Regra) : r))
      );
    }

    setDrawerOpen(false);
  }

  function handleDelete(id: string) {
    setRegras((prev) => prev.filter((r) => r.id !== id));
  }

  function toggleAtivo(id: string) {
    setRegras((prev) => prev.map((r) => (r.id === id ? { ...r, ativo: !r.ativo } : r)));
  }

  return (
    <AppShell title="Regras">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Regras de Conciliação</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Defina regras por descrição OFX, valor, tipo de movimento e categoria contábil.
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openNew}>
            Nova regra
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <KpiCard
            label="Regras ativas"
            value={regras.filter((r) => r.ativo).length}
            sub={`de ${regras.length} total`}
          />
          <KpiCard
            label="Sugestões geradas"
            value={regras.reduce((s, r) => s + r.hits, 0)}
            sub="histórico importado"
          />
          <KpiCard
            label="Confiança média"
            value={`${Math.round(
              regras.reduce((s, r) => s + r.confianca, 0) / Math.max(regras.length, 1)
            )}%`}
            sub="entre regras cadastradas"
          />
          <KpiCard label="Automação" value="81%" sub="estimativa atual" />
        </div>

        <div className="relative w-72">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <Input
            placeholder="Buscar regra ou keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-elev)]">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Zap size={20} />}
              title="Nenhuma regra"
              description="Crie regras para categorizar movimentos automaticamente."
              action={
                <Button variant="primary" size="sm" onClick={openNew}>
                  Nova regra
                </Button>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--bg-sunken)]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Regra
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    CNPJ
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Critérios
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Categoria
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Confiança
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Hits
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-faint)]">
                    Status
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((regra) => {
                  const cat = CATEGORIAS.find((c) => c.id === regra.categoriaId);
                  const cnpj = CNPJS.find((c) => c.id === regra.cnpjId);

                  return (
                    <tr
                      key={regra.id}
                      onClick={() => openEdit(regra)}
                      className={cn(
                        'cursor-pointer border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--bg-hover)]',
                        !regra.ativo && 'opacity-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--text)]">{regra.nome}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-[var(--text)]">
                          {regra.cnpjId === '*' ? 'Todos os CNPJs' : cnpj?.nomeFantasia || regra.cnpjId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex max-w-sm flex-wrap items-center gap-1">
                          <Badge color={regra.tipoMov === 'credito' ? 'green' : regra.tipoMov === 'ambos' ? 'gray' : 'red'}>
                            {regra.tipoMov === 'ambos' ? 'D + C' : regra.tipoMov === 'debito' ? 'Débito' : 'Crédito'}
                          </Badge>
                          {regra.keywords.slice(0, 2).map((kw) => (
                            <span key={kw} className="rounded bg-[var(--bg-sunken)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-muted)]">
                              {kw}
                            </span>
                          ))}
                          {regra.keywords.length > 2 && (
                            <span className="rounded bg-[var(--bg-sunken)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-muted)]">
                              +{regra.keywords.length - 2}
                            </span>
                          )}
                        </div>
                        {(regra.valorMin || regra.valorMax) && (
                          <div className="mt-1 font-mono text-[11px] text-[var(--text-faint)]">
                            {regra.valorMin ? `≥ R$ ${fmtMoney(regra.valorMin)}` : ''}
                            {regra.valorMin && regra.valorMax ? ' · ' : ''}
                            {regra.valorMax ? `≤ R$ ${fmtMoney(regra.valorMax)}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {cat ? <span className="text-xs font-medium text-[var(--text)]">{cat.nome}</span> : <span className="text-xs text-[var(--text-faint)]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Confidence value={regra.confianca} />
                      </td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums text-[var(--text-muted)]">
                        <b>{regra.hits}</b>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleAtivo(regra.id)}
                          className={cn(
                            'rounded-full border border-[var(--line-faint)] px-2 py-0.5 text-xs font-semibold',
                            regra.ativo
                              ? 'bg-[var(--green-bg)] text-[var(--green)]'
                              : 'bg-[var(--bg-sunken)] text-[var(--text-faint)]'
                          )}
                        >
                          {regra.ativo ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(regra)}
                            className="cursor-pointer rounded p-1.5 text-[var(--text-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent)]"
                            title="Editar"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(regra.id)}
                            className="cursor-pointer rounded p-1.5 text-[var(--text-faint)] hover:bg-[var(--red-bg)] hover:text-[var(--red)]"
                            title="Excluir"
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

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={isNew ? 'Nova regra de conciliação' : 'Editar regra'}
          width="lg"
        >
          <RuleBuilderForm
            rule={editing}
            isNew={isNew}
            onChange={setEditing}
            onClose={() => setDrawerOpen(false)}
            onSave={handleSave}
          />
        </Drawer>
      </div>
    </AppShell>
  );
}

type RuleBuilderFormProps = {
  rule: Partial<Regra>;
  isNew: boolean;
  onChange: React.Dispatch<React.SetStateAction<Partial<Regra>>>;
  onClose: () => void;
  onSave: () => void;
};

function RuleBuilderForm({ rule, isNew, onChange, onClose, onSave }: RuleBuilderFormProps) {
  const [kwInput, setKwInput] = useState('');

  const keywords = rule.keywords || [];
  const cat = CATEGORIAS.find((c) => c.id === rule.categoriaId);
  const contaDeb = cat?.contaDebId ? CONTAS_CONTABEIS.find((c) => c.id === cat.contaDebId) : null;
  const contaCred = cat?.contaCredId ? CONTAS_CONTABEIS.find((c) => c.id === cat.contaCredId) : null;

  const preview = useMemo(() => {
    return MOVIMENTACOES.filter((m) => {
      if (rule.cnpjId && rule.cnpjId !== '*' && m.cnpjId !== rule.cnpjId) return false;
      if (rule.tipoMov && rule.tipoMov !== 'ambos' && m.tipo !== rule.tipoMov) return false;
      if (rule.valorMin && m.valor < rule.valorMin) return false;
      if (rule.valorMax && m.valor > rule.valorMax) return false;
      if (keywords.length > 0) {
        const desc = String(m.descricaoOFX || '').toUpperCase();
        if (!keywords.some((kw) => desc.includes(kw))) return false;
      }
      return true;
    }).slice(0, 5);
  }, [keywords, rule.cnpjId, rule.tipoMov, rule.valorMin, rule.valorMax]);

  const canSave = Boolean(rule.nome?.trim()) && Boolean(rule.categoriaId) && keywords.length > 0;

  function patch(next: Partial<Regra>) {
    onChange((prev) => ({ ...prev, ...next }));
  }

  function addKeyword() {
    const value = kwInput.trim().toUpperCase();
    if (!value || keywords.includes(value)) return;
    patch({ keywords: [...keywords, value] });
    setKwInput('');
  }

  function removeKeyword(keyword: string) {
    patch({ keywords: keywords.filter((k) => k !== keyword) });
  }

  return (
    <div className="flex max-h-[calc(100vh-7rem)] flex-col">
      <div className="border-b border-[var(--line)] px-5 pb-4">
        <div className="flex items-start gap-3 rounded-xl bg-[var(--accent-soft)] p-3 text-[var(--accent-strong)]">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--bg-elev)]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold">{isNew ? 'Criar regra inteligente' : 'Ajustar regra inteligente'}</div>
            <div className="mt-0.5 text-xs opacity-80">
              Regras com confiança maior ou igual a 90% podem conciliar automaticamente. Abaixo disso, viram sugestão para revisão.
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <Field label="Nome da regra" required>
          <Input
            value={rule.nome || ''}
            onChange={(e) => patch({ nome: e.target.value })}
            placeholder='Ex.: "Tarifa Bancária — Itaú"'
          />
        </Field>

        <Field label="CNPJ aplicável" hint="Selecione um CNPJ específico ou aplique a todos.">
          <Select
            value={rule.cnpjId || '*'}
            onChange={(e) => patch({ cnpjId: e.target.value })}
          >
            <option value="*">Todos os CNPJs</option>
            {CNPJS.filter((c) => c.id !== 'geral').map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomeFantasia}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Palavras-chave na descrição (OFX)"
          required
          hint="A regra é acionada quando qualquer uma das palavras é encontrada. A comparação ignora maiúsculas/minúsculas."
        >
          <div className="flex gap-2">
            <Input
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              placeholder='Ex.: "TARIFA BANCARIA", "TAR PAC"'
              className="flex-1 font-mono uppercase"
            />
            <Button variant="secondary" size="md" icon={<Plus size={14} />} onClick={addKeyword}>
              Adicionar
            </Button>
          </div>

          {keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-xs text-[var(--accent-strong)]"
                >
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="cursor-pointer hover:text-[var(--red)]" title="Remover">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Tipo de movimento" required>
          <div className="flex gap-1.5">
            {[
              { value: 'debito', label: 'Débito' },
              { value: 'credito', label: 'Crédito' },
              { value: 'ambos', label: 'Ambos' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => patch({ tipoMov: option.value as Regra['tipoMov'] })}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  rule.tipoMov === option.value
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                    : 'border-[var(--line)] bg-[var(--bg-elev)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Valor mínimo (R$)" hint="Use 0 para sem mínimo.">
            <Input
              type="number"
              value={rule.valorMin ?? 0}
              step="0.01"
              min={0}
              onChange={(e) => patch({ valorMin: Number(e.target.value) })}
              className="font-mono"
            />
          </Field>

          <Field label="Valor máximo (R$)" hint="Deixe em branco para sem máximo.">
            <Input
              type="number"
              value={rule.valorMax ?? ''}
              step="0.01"
              min={0}
              placeholder="—"
              onChange={(e) => patch({ valorMax: e.target.value === '' ? null : Number(e.target.value) })}
              className="font-mono"
            />
          </Field>
        </div>

        <div className="h-px bg-[var(--line)]" />

        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Sugestão contábil</div>

        <Field
          label="Categoria sugerida"
          required
          hint="Ao aplicar a regra, a categoria define automaticamente conta débito e crédito."
        >
          <Select value={rule.categoriaId || ''} onChange={(e) => patch({ categoriaId: e.target.value })}>
            <option value="">— selecionar categoria —</option>
            {CATEGORIAS.filter((c) => c.ativo).map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </Field>

        {cat && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-sunken)] p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Lançamento contábil sugerido
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Badge color="red">D — Débito</Badge>
                <div className="mt-1.5 text-sm font-medium text-[var(--text)]">{contaDeb?.nome || '—'}</div>
                <div className="font-mono text-xs text-[var(--text-faint)]">{contaDeb?.codigo || ''}</div>
              </div>
              <div>
                <Badge color="green">C — Crédito</Badge>
                <div className="mt-1.5 text-sm font-medium text-[var(--text)]">{contaCred?.nome || '—'}</div>
                <div className="font-mono text-xs text-[var(--text-faint)]">{contaCred?.codigo || ''}</div>
              </div>
            </div>
          </div>
        )}

        <Field
          label={`Grau de confiança · ${rule.confianca ?? 85}%`}
          hint="Acima de 90% a regra concilia automaticamente. Abaixo, gera sugestão para revisão."
        >
          <input
            type="range"
            min={50}
            max={100}
            value={rule.confianca ?? 85}
            onChange={(e) => patch({ confianca: Number(e.target.value) })}
            className="w-full"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-[var(--text-faint)]">
            <span>50% — apenas sugere</span>
            <span>90% — auto-concilia</span>
            <span>100%</span>
          </div>
        </Field>

        <div className="h-px bg-[var(--line)]" />

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <Eye size={14} />
          Pré-visualização ({preview.length} movimentações afetadas)
        </div>

        {preview.length > 0 ? (
          <div className="flex flex-col gap-1.5 rounded-xl bg-[var(--bg-sunken)] p-3">
            {preview.map((m) => (
              <div key={m.id} className="grid grid-cols-[70px_1fr_110px] items-center gap-3 text-xs">
                <span className="font-mono text-[var(--text-faint)]">{m.data}</span>
                <span className="truncate font-mono text-[var(--text)]">{m.descricaoOFX}</span>
                <span
                  className={cn(
                    'text-right font-mono',
                    m.tipo === 'debito' ? 'text-[var(--red)]' : 'text-[var(--green)]'
                  )}
                >
                  {m.tipo === 'debito' ? '−' : '+'}{fmtMoney(m.valor)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-5 text-center text-xs text-[var(--text-faint)]">
            Nenhuma movimentação histórica corresponde aos critérios. Ajuste palavras-chave ou faixa de valor.
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--line)] p-5">
        <label className="mr-auto flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={rule.ativo ?? true}
            onChange={(e) => patch({ ativo: e.target.checked })}
          />
          Ativar regra imediatamente
        </label>

        <Button variant="secondary" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="md" icon={<Check size={14} />} disabled={!canSave} onClick={onSave}>
          {isNew ? 'Criar regra' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  sub: string;
};

function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-elev)] p-3">
      <div className="text-xs font-medium text-[var(--text-faint)]">{label}</div>
      <div className="mt-1 text-xl font-bold text-[var(--text)]">{value}</div>
      <div className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</div>
    </div>
  );
}
