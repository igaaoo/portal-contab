'use client';

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { KPI } from '@/components/ui/KPI';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/store/AppContext';
import { CONTAS_BANCARIAS, BANCOS, CNPJS, fmtMoney } from '@/lib/data';
import { MovStatus } from '@/types';

const DAYS = ['08/05', '09/05', '10/05', '11/05', '12/05', '13/05', '14/05'];

export default function DashboardPage() {
  const { movimentacoes, cnpjId } = useApp();

  const filtered = useMemo(
    () => (cnpjId === 'geral' ? movimentacoes : movimentacoes.filter((m) => m.cnpjId === cnpjId)),
    [movimentacoes, cnpjId]
  );

  const totalEntradas = filtered.filter((m) => m.tipo === 'credito').reduce((s, m) => s + m.valor, 0);
  const totalSaidas = filtered.filter((m) => m.tipo === 'debito').reduce((s, m) => s + m.valor, 0);
  const pendentes = filtered.filter((m) => m.status === 'pendente').length;
  const conciliados = filtered.filter((m) => m.status === 'conciliado').length;
  const divergentes = filtered.filter((m) => m.status === 'divergente').length;
  const sugeridos = filtered.filter((m) => m.status === 'sugerido').length;

  const statusCounts: Record<MovStatus, number> = {
    pendente: 0,
    sugerido: 0,
    conciliado: 0,
    divergente: 0,
    ignorado: 0,
    revisar: 0,
  };
  filtered.forEach((m) => statusCounts[m.status]++);

  const catMap: Record<string, { total: number; count: number }> = {};
  filtered.forEach((m) => {
    if (m.categoria) {
      if (!catMap[m.categoria]) catMap[m.categoria] = { total: 0, count: 0 };
      catMap[m.categoria].total += m.valor;
      catMap[m.categoria].count++;
    }
  });
  const topCats = Object.entries(catMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);

  const dailyData = DAYS.map((day) => {
    const dayMovs = filtered.filter((m) => m.data.startsWith(day.split('/').reverse().join('/')));
    const credits = dayMovs.filter((m) => m.tipo === 'credito').reduce((s, m) => s + m.valor, 0);
    const debits = dayMovs.filter((m) => m.tipo === 'debito').reduce((s, m) => s + m.valor, 0);
    return { day, credits, debits };
  });

  const maxVal = Math.max(...dailyData.flatMap((d) => [d.credits, d.debits]), 1);

  const cnpj = CNPJS.find((c) => c.id === cnpjId);
  const accounts = cnpjId === 'geral'
    ? CONTAS_BANCARIAS
    : CONTAS_BANCARIAS.filter((c) => c.cnpjId === cnpjId);
  const totalSaldo = accounts.reduce((s, c) => s + c.saldo, 0);

  return (
    <AppShell title="Dashboard">
      <div className="p-5 space-y-5 ">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              {cnpj?.id === 'geral' ? 'Visão Geral do Grupo' : cnpj?.nomeFantasia || 'Dashboard'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Maio 2026 — Atualizado agora</p>
          </div>
          <Button variant="outline" size="sm" icon={<RefreshCw size={13} />}>
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI
            label="Saldo Total"
            value={`R$ ${fmtMoney(totalSaldo)}`}
            sub={`${accounts.length} conta(s)`}
            icon={<DollarSign size={16} />}
            accent
          />
          <KPI
            label="Entradas (Mai)"
            value={`R$ ${fmtMoney(totalEntradas)}`}
            trend="up"
            trendValue="maio/26"
            icon={<TrendingUp size={16} />}
          />
          <KPI
            label="Saídas (Mai)"
            value={`R$ ${fmtMoney(totalSaidas)}`}
            trend="down"
            trendValue="maio/26"
            icon={<TrendingDown size={16} />}
          />
          <KPI
            label="Pendentes"
            value={String(pendentes)}
            sub={`${divergentes} divergentes • ${sugeridos} sugeridos`}
            icon={<Clock size={16} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <span className="font-semibold text-sm text-[var(--text)]">Fluxo Diário</span>
              <Badge color="accent">Mai 2026</Badge>
            </CardHeader>
            <div className="flex items-end gap-2 h-32 pb-6 relative">
              {dailyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="flex items-end gap-0.5 w-full justify-center h-24">
                    <div
                      className="flex-1 bg-[var(--green)] rounded-t-sm opacity-80 transition-all"
                      style={{ height: `${(d.credits / maxVal) * 96}px`, minHeight: d.credits > 0 ? 2 : 0 }}
                      title={`Entradas: R$ ${fmtMoney(d.credits)}`}
                    />
                    <div
                      className="flex-1 bg-[var(--red)] rounded-t-sm opacity-70 transition-all"
                      style={{ height: `${(d.debits / maxVal) * 96}px`, minHeight: d.debits > 0 ? 2 : 0 }}
                      title={`Saídas: R$ ${fmtMoney(d.debits)}`}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-faint)]">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-2 border-t border-[var(--line)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--green)] opacity-80" />
                Entradas
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--red)] opacity-70" />
                Saídas
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <span className="font-semibold text-sm text-[var(--text)]">Status Movimentos</span>
              <BarChart3 size={14} className="text-[var(--text-faint)]" />
            </CardHeader>
            <div className="space-y-2">
              {[
                { key: 'conciliado', label: 'Conciliados', color: 'var(--green)', count: conciliados },
                { key: 'sugerido', label: 'Sugeridos', color: 'var(--blue)', count: sugeridos },
                { key: 'pendente', label: 'Pendentes', color: 'var(--amber)', count: pendentes },
                { key: 'divergente', label: 'Divergentes', color: 'var(--red)', count: divergentes },
                { key: 'revisar', label: 'Revisar', color: 'var(--violet)', count: statusCounts.revisar },
                { key: 'ignorado', label: 'Ignorados', color: 'var(--text-faint)', count: statusCounts.ignorado },
              ].map(({ label, color, count }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `var(${color.slice(4, -1)})` }} />
                  <span className="flex-1 text-xs text-[var(--text-muted)]">{label}</span>
                  <span className="text-xs font-semibold text-[var(--text)] tabular-nums">{count}</span>
                  <div className="w-16 h-1.5 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${filtered.length ? (count / filtered.length) * 100 : 0}%`,
                        background: `var(${color.slice(4, -1)})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <span className="font-semibold text-sm text-[var(--text)]">Top Categorias</span>
            </CardHeader>
            <div className="space-y-2.5">
              {topCats.length === 0 ? (
                <p className="text-sm text-[var(--text-faint)] py-4 text-center">Nenhuma categoria registrada</p>
              ) : (
                topCats.map(([cat, { total, count }]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-[var(--text)] truncate">{cat}</span>
                        <span className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                          R$ {fmtMoney(total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full"
                            style={{
                              width: `${topCats[0] ? (total / topCats[0][1].total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--text-faint)] shrink-0">{count} mov.</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <span className="font-semibold text-sm text-[var(--text)]">Contas Bancárias</span>
              <span className="text-xs text-[var(--text-faint)]">Saldo total: R$ {fmtMoney(totalSaldo)}</span>
            </CardHeader>
            <div className="space-y-2">
              {accounts.slice(0, 5).map((conta) => {
                const banco = BANCOS.find((b) => b.id === conta.bancoId);
                return (
                  <div key={conta.id} className="flex items-center gap-3 py-1">
                    <div
                      className="w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: banco?.cor || '#888' }}
                    >
                      {banco?.codigo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[var(--text)] truncate">{conta.apelido}</div>
                      <div className="text-[10px] text-[var(--text-faint)]">{conta.agencia} / {conta.conta}</div>
                    </div>
                    <div className="text-xs font-semibold text-[var(--text)] tabular-nums">
                      R$ {fmtMoney(conta.saldo)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <span className="font-semibold text-sm text-[var(--text)]">Últimas Movimentações</span>
            <div className="flex gap-2">
              <Badge color="amber" dot>{pendentes} pendentes</Badge>
              {divergentes > 0 && <Badge color="red" dot>{divergentes} divergentes</Badge>}
              {conciliados > 0 && <Badge color="green" dot>{conciliados} conciliados</Badge>}
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  {['Data', 'Descrição', 'Tipo', 'Valor', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-2 text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide px-1"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 8).map((mov) => (
                  <tr key={mov.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-2 px-1 text-xs text-[var(--text-faint)] tabular-nums whitespace-nowrap">
                      {mov.data}
                    </td>
                    <td className="py-2 px-1 max-w-xs">
                      <span className="text-xs text-[var(--text)] line-clamp-1">{mov.descricaoOFX}</span>
                      {mov.categoria && (
                        <span className="text-[10px] text-[var(--text-faint)]">{mov.categoria}</span>
                      )}
                    </td>
                    <td className="py-2 px-1">
                      <Badge color={mov.tipo === 'credito' ? 'green' : 'red'}>
                        {mov.tipo === 'credito' ? 'Crédito' : 'Débito'}
                      </Badge>
                    </td>
                    <td className="py-2 px-1 text-xs font-semibold tabular-nums whitespace-nowrap">
                      <span className={mov.tipo === 'credito' ? 'text-[var(--green)]' : 'text-[var(--text)]'}>
                        {mov.tipo === 'credito' ? '+' : '-'} R$ {fmtMoney(mov.valor)}
                      </span>
                    </td>
                    <td className="py-2 px-1">
                      <StatusBadge status={mov.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {(divergentes > 0 || pendentes > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {divergentes > 0 && (
              <div className="flex items-start gap-3 p-4 bg-[var(--red-bg)] rounded-xl border border-[var(--red)]/20">
                <AlertTriangle size={16} className="text-[var(--red)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[var(--red)]">{divergentes} movimentos divergentes</div>
                  <div className="text-xs text-[var(--red)]/80">Requerem atenção imediata — verifique no Conciliador</div>
                </div>
              </div>
            )}
            {pendentes > 0 && (
              <div className="flex items-start gap-3 p-4 bg-[var(--amber-bg)] rounded-xl border border-[var(--amber)]/20">
                <Clock size={16} className="text-[var(--amber)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[var(--amber)]">{pendentes} movimentos pendentes</div>
                  <div className="text-xs text-[var(--amber)]/80">Aguardando classificação manual</div>
                </div>
              </div>
            )}
            {conciliados > 0 && (
              <div className="flex items-start gap-3 p-4 bg-[var(--green-bg)] rounded-xl border border-[var(--green)]/20">
                <CheckCircle2 size={16} className="text-[var(--green)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[var(--green)]">{conciliados} movimentos conciliados</div>
                  <div className="text-xs text-[var(--green)]/80">Processados com sucesso</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
