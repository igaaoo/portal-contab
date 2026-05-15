'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  ArrowUpDown,
  CheckCheck,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Confidence } from '@/components/ui/Confidence';
import { Tabs } from '@/components/ui/Tabs';
import { Drawer } from '@/components/ui/Drawer';
import { Select } from '@/components/ui/Input';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/store/AppContext';
import { CATEGORIAS, CONTAS_BANCARIAS, BANCOS, CONTAS_CONTABEIS, fmtMoney } from '@/lib/data';
import { Movimentacao, MovStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'sugerido', label: 'Sugeridos' },
  { id: 'divergente', label: 'Divergentes' },
  { id: 'conciliado', label: 'Conciliados' },
  { id: 'revisar', label: 'Revisar' },
];

export default function ConciliadorPage() {
  const { movimentacoes, setMovimentacoes, cnpjId } = useApp();
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerMov, setDrawerMov] = useState<Movimentacao | null>(null);
  const [editCategoria, setEditCategoria] = useState('');

  const base = useMemo(
    () => (cnpjId === 'geral' ? movimentacoes : movimentacoes.filter((m) => m.cnpjId === cnpjId)),
    [movimentacoes, cnpjId]
  );

  const counts: Record<string, number> = {
    all: base.length,
    pendente: base.filter((m) => m.status === 'pendente').length,
    sugerido: base.filter((m) => m.status === 'sugerido').length,
    divergente: base.filter((m) => m.status === 'divergente').length,
    conciliado: base.filter((m) => m.status === 'conciliado').length,
    revisar: base.filter((m) => m.status === 'revisar').length,
  };

  const filtered = useMemo(() => {
    let arr = base;
    if (statusTab !== 'all') arr = arr.filter((m) => m.status === statusTab);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (m) =>
          m.descricaoOFX.toLowerCase().includes(q) ||
          m.doc?.toLowerCase().includes(q) ||
          m.categoria?.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [base, statusTab, search]);

  const allSelected =
    filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const someSelected = filtered.some((m) => selected.has(m.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((m) => next.delete(m.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((m) => next.add(m.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function bulkAction(newStatus: MovStatus) {
    setMovimentacoes((prev) =>
      prev.map((m) =>
        selected.has(m.id) ? { ...m, status: newStatus } : m
      )
    );
    setSelected(new Set());
  }

  function confirmMovimento(mov: Movimentacao) {
    setMovimentacoes((prev) =>
      prev.map((m) =>
        m.id === mov.id ? { ...m, status: 'conciliado', categoriaId: editCategoria || m.categoriaId } : m
      )
    );
    setDrawerMov(null);
  }

  function rejectMovimento(mov: Movimentacao) {
    setMovimentacoes((prev) =>
      prev.map((m) => (m.id === mov.id ? { ...m, status: 'divergente' } : m))
    );
    setDrawerMov(null);
  }

  function openDrawer(mov: Movimentacao) {
    setDrawerMov(mov);
    setEditCategoria(mov.categoriaId || '');
  }

  const tabsWithCounts = STATUS_TABS.map((t) => ({ ...t, count: counts[t.id] }));

  const conta = drawerMov
    ? CONTAS_BANCARIAS.find((c) => c.id === drawerMov.contaBancariaId)
    : null;
  const banco = conta ? BANCOS.find((b) => b.id === conta.bancoId) : null;
  const catDrawer = drawerMov
    ? CATEGORIAS.find((c) => c.id === (editCategoria || drawerMov.categoriaId))
    : null;

  return (
    <AppShell title="Conciliador">
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="border-b border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3 flex flex-wrap items-center gap-3">
          <Tabs tabs={tabsWithCounts} active={statusTab} onChange={setStatusTab} />
          <div className="flex-1" />
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
            />
            <input
              type="text"
              placeholder="Buscar descrição, doc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-56 pl-7 pr-3 text-xs rounded-md border border-[var(--line)] bg-[var(--bg-sunken)] text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <Button variant="outline" size="sm" icon={<Filter size={12} />}>
            Filtros
          </Button>
        </div>

        {/* Bulk actions */}
        {someSelected && (
          <div className="px-4 py-2 bg-[var(--accent-soft)] border-b border-[var(--accent-soft)] flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--accent-strong)]">
              {selected.size} selecionado(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="xs"
                icon={<CheckCheck size={11} />}
                onClick={() => bulkAction('conciliado')}
              >
                Conciliar
              </Button>
              <Button
                variant="ghost"
                size="xs"
                icon={<EyeOff size={11} />}
                onClick={() => bulkAction('ignorado')}
              >
                Ignorar
              </Button>
              <Button
                variant="ghost"
                size="xs"
                icon={<AlertTriangle size={11} />}
                onClick={() => bulkAction('revisar')}
              >
                Revisar
              </Button>
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-[var(--text-faint)] hover:text-[var(--text)] cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--bg-elev)] border-b border-[var(--line)]">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onChange={toggleAll}
                  />
                </th>
                {['Data', 'Conta', 'Descrição', 'Categoria', 'Valor', 'Confiança', 'Status', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {h}
                        {['Data', 'Valor'].includes(h) && <ArrowUpDown size={10} />}
                      </span>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-[var(--text-faint)] text-sm">
                    Nenhum movimento encontrado
                  </td>
                </tr>
              )}
              {filtered.map((mov) => {
                const contaBanc = CONTAS_BANCARIAS.find((c) => c.id === mov.contaBancariaId);
                const bancoInfo = contaBanc ? BANCOS.find((b) => b.id === contaBanc.bancoId) : null;
                const isSelected = selected.has(mov.id);

                return (
                  <tr
                    key={mov.id}
                    className={cn(
                      'border-b border-[var(--line)] last:border-0 transition-colors',
                      isSelected ? 'bg-[var(--accent-soft)]/30' : 'hover:bg-[var(--bg-hover)]',
                      mov.status === 'divergente' && 'border-l-2 border-l-[var(--red)]'
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <Checkbox checked={isSelected} onChange={() => toggleOne(mov.id)} />
                    </td>
                    <td className="px-2 py-2.5 text-xs text-[var(--text-faint)] tabular-nums whitespace-nowrap">
                      {mov.data}
                      {mov.hora && (
                        <div className="text-[10px] text-[var(--text-faint)]/60">{mov.hora}</div>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {bancoInfo && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-md text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                            style={{ backgroundColor: bancoInfo.cor }}
                          >
                            {bancoInfo.codigo}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] truncate max-w-[80px]">
                            {contaBanc?.apelido}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2.5 max-w-xs">
                      <div className="text-xs text-[var(--text)] line-clamp-1 font-medium">
                        {mov.descricaoOFX}
                      </div>
                      {mov.doc && (
                        <div className="text-[10px] text-[var(--text-faint)] font-mono">{mov.doc}</div>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {mov.categoria ? (
                        <Badge color="accent">{mov.categoria}</Badge>
                      ) : (
                        <span className="text-xs text-[var(--text-faint)] italic">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-xs font-semibold tabular-nums whitespace-nowrap">
                      <span
                        className={
                          mov.tipo === 'credito' ? 'text-[var(--green)]' : 'text-[var(--text)]'
                        }
                      >
                        {mov.tipo === 'credito' ? '+' : '-'} R$ {fmtMoney(mov.valor)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      {mov.confianca ? <Confidence value={mov.confianca} /> : <span className="text-xs text-[var(--text-faint)]">—</span>}
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={mov.status} />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1">
                        {(mov.status === 'sugerido' || mov.status === 'pendente') && (
                          <>
                            <button
                              onClick={() =>
                                setMovimentacoes((prev) =>
                                  prev.map((m) =>
                                    m.id === mov.id ? { ...m, status: 'conciliado' } : m
                                  )
                                )
                              }
                              className="p-1 rounded hover:bg-[var(--green-bg)] text-[var(--text-faint)] hover:text-[var(--green)] cursor-pointer transition-colors"
                              title="Confirmar"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() =>
                                setMovimentacoes((prev) =>
                                  prev.map((m) =>
                                    m.id === mov.id ? { ...m, status: 'divergente' } : m
                                  )
                                )
                              }
                              className="p-1 rounded hover:bg-[var(--red-bg)] text-[var(--text-faint)] hover:text-[var(--red)] cursor-pointer transition-colors"
                              title="Rejeitar"
                            >
                              <X size={13} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openDrawer(mov)}
                          className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--text)] cursor-pointer transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--line)] bg-[var(--bg-elev)] px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-[var(--text-faint)]">
            {filtered.length} de {base.length} movimentos
          </span>
          <div className="flex items-center gap-2 text-xs text-[var(--text-faint)]">
            Total: R$ {fmtMoney(filtered.reduce((s, m) => s + (m.tipo === 'credito' ? m.valor : -m.valor), 0))}
          </div>
        </div>

        {/* Detail Drawer */}
        <Drawer
          open={!!drawerMov}
          onClose={() => setDrawerMov(null)}
          title="Detalhes da Movimentação"
          width="lg"
        >
          {drawerMov && (
            <div className="p-5 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-[var(--text-faint)] font-mono mb-1">{drawerMov.id}</div>
                  <div className="font-semibold text-[var(--text)] leading-snug">{drawerMov.descricaoOFX}</div>
                  <div className="text-sm text-[var(--text-muted)] mt-0.5">{drawerMov.data}{drawerMov.hora ? ` às ${drawerMov.hora}` : ''}</div>
                </div>
                <StatusBadge status={drawerMov.status} />
              </div>

              <div className={cn(
                'text-3xl font-bold tabular-nums',
                drawerMov.tipo === 'credito' ? 'text-[var(--green)]' : 'text-[var(--text)]'
              )}>
                {drawerMov.tipo === 'credito' ? '+' : '-'} R$ {fmtMoney(drawerMov.valor)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tipo', value: drawerMov.tipo === 'credito' ? 'Crédito' : 'Débito' },
                  { label: 'Documento', value: drawerMov.doc || '—' },
                  { label: 'Conta', value: conta?.apelido || '—' },
                  { label: 'Banco', value: banco?.nome || '—' },
                  { label: 'Usuário', value: drawerMov.usuario || '—' },
                  { label: 'Regra', value: drawerMov.regraId || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--bg-sunken)] rounded-lg p-3">
                    <div className="text-xs text-[var(--text-faint)] mb-0.5">{label}</div>
                    <div className="text-sm font-medium text-[var(--text)]">{value}</div>
                  </div>
                ))}
              </div>

              {drawerMov.confianca && (
                <div className="bg-[var(--bg-sunken)] rounded-lg p-3">
                  <div className="text-xs text-[var(--text-faint)] mb-2">Confiança da Sugestão</div>
                  <Confidence value={drawerMov.confianca} />
                </div>
              )}

              <div>
                <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Categoria
                </div>
                <Select
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value)}
                  className="h-9"
                >
                  <option value="">— Selecionar categoria —</option>
                  {CATEGORIAS.filter((c) => c.ativo).map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </div>

              {catDrawer && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--blue-bg)] rounded-lg p-3">
                    <div className="text-xs text-[var(--blue)] mb-1">Conta Débito</div>
                    <div className="text-xs font-mono text-[var(--text)]">
                      {CONTAS_CONTABEIS.find((c) => c.id === catDrawer.contaDebId)?.codigo || '—'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {CONTAS_CONTABEIS.find((c) => c.id === catDrawer.contaDebId)?.nome || '—'}
                    </div>
                  </div>
                  <div className="bg-[var(--green-bg)] rounded-lg p-3">
                    <div className="text-xs text-[var(--green)] mb-1">Conta Crédito</div>
                    <div className="text-xs font-mono text-[var(--text)]">
                      {CONTAS_CONTABEIS.find((c) => c.id === catDrawer.contaCredId)?.codigo || '—'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {CONTAS_CONTABEIS.find((c) => c.id === catDrawer.contaCredId)?.nome || '—'}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Check size={14} />}
                  onClick={() => confirmMovimento(drawerMov)}
                  className="flex-1"
                >
                  Confirmar
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  icon={<X size={14} />}
                  onClick={() => rejectMovimento(drawerMov)}
                  className="flex-1"
                >
                  Divergente
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon={<EyeOff size={14} />}
                  onClick={() => {
                    setMovimentacoes((prev) =>
                      prev.map((m) => m.id === drawerMov.id ? { ...m, status: 'ignorado' } : m)
                    );
                    setDrawerMov(null);
                  }}
                >
                  Ignorar
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </AppShell>
  );
}
