'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  GitMerge,
  Upload,
  Settings,
  Tag,
  BookOpen,
  Zap,
  Building2,
  CreditCard,
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeft,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { USUARIO_LOGADO } from '@/lib/data';

interface NavChild {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  children?: NavChild[];
}

interface NavGroup {
  sectionLabel?: string;
  icon: React.ReactNode;
  label: string;
  children: NavChild[];
}

const GROUPS: NavGroup[] = [
  {
    sectionLabel: 'MÓDULOS',
    icon: <ArrowUpDown size={15} />,
    label: 'Conciliação',
    children: [
      { href: '/conciliacao/conciliador', icon: <GitMerge size={14} />, label: 'Conciliador' },
      { href: '/conciliacao/importacao', icon: <Upload size={14} />, label: 'Importação OFX' },
      {
        href: '/conciliacao/configuracoes',
        icon: <Settings size={14} />,
        label: 'Configurações',
        children: [
          { href: '/conciliacao/configuracoes/categorias', icon: <Tag size={13} />, label: 'Categorias' },
          { href: '/conciliacao/configuracoes/contas-dc', icon: <BookOpen size={13} />, label: 'Contas D/C' },
          { href: '/conciliacao/configuracoes/regras', icon: <Zap size={13} />, label: 'Regras' },
          { href: '/conciliacao/configuracoes/cnpjs', icon: <Building2 size={13} />, label: 'CNPJs' },
          { href: '/conciliacao/configuracoes/contas-bancarias', icon: <CreditCard size={13} />, label: 'Contas Bancárias' },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Conciliação: true });
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({
    Configurações: pathname.startsWith('/configuracoes'),
  });

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[var(--line)] bg-[var(--bg-elev)] transition-all duration-200 shrink-0',
        collapsed ? 'w-12' : 'w-56'
      )}
    >
      {/* Logo */}
      {collapsed ? (
        <div className="h-14 flex items-center justify-center border-b border-[var(--line)] shrink-0">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] transition-colors cursor-pointer"
            title="Expandir menu"
          >
            <PanelLeft size={14} />
          </button>
        </div>
      ) : (
        <div className="h-14 flex items-center gap-2.5 px-3 border-b border-[var(--line)] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm text-[var(--text)] truncate">Portal Contab</span>
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] transition-colors cursor-pointer shrink-0"
            title="Recolher menu"
          >
            <PanelLeft size={14} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* Visão Geral */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors mb-3',
            isActive('/dashboard')
              ? 'text-[var(--accent)] font-medium bg-[var(--accent-soft)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
          )}
          title={collapsed ? 'Visão Geral' : undefined}
        >
          <Home size={15} className="shrink-0" />
          {!collapsed && <span>Visão Geral</span>}
        </Link>
        {GROUPS.map((group) => {
          const groupOpen = openGroups[group.label] ?? true;
          const hasActiveChild = group.children.some(
            (c) => isActive(c.href) || c.children?.some((cc) => isActive(cc.href))
          );

          return (
            <div key={group.label}>
              {/* Section label */}
              {!collapsed && group.sectionLabel && (
                <p className="px-2 mb-1 text-[10px] font-semibold tracking-widest text-[var(--text-faint)] uppercase select-none">
                  {group.sectionLabel}
                </p>
              )}

              {/* Group header */}
              <button
                onClick={() => setOpenGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
                  hasActiveChild
                    ? 'text-[var(--text)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                )}
                title={collapsed ? group.label : undefined}
              >
                <span className="shrink-0 text-[var(--text-faint)]">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronDown
                      size={12}
                      className={cn(
                        'text-[var(--text-faint)] transition-transform shrink-0',
                        groupOpen && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </button>

              {/* Children */}
              {!collapsed && groupOpen && (
                <div className="mt-0.5 mb-2 flex flex-col">
                  {group.children.map((child) => {
                    const hasSubs = !!child.children?.length;
                    const subOpen = openSubs[child.label] ?? false;
                    const childActive = isActive(child.href);
                    const subActive = child.children?.some((cc) => isActive(cc.href));

                    return (
                      <div key={child.href}>
                        {hasSubs ? (
                          <button
                            onClick={() =>
                              setOpenSubs((prev) => ({ ...prev, [child.label]: !prev[child.label] }))
                            }
                            className={cn(
                              'w-full flex items-center gap-2.5 pl-6 pr-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer',
                              subActive
                                ? 'text-[var(--accent)] font-medium'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                            )}
                          >
                            <span className="shrink-0">{child.icon}</span>
                            <span className="flex-1 text-left">{child.label}</span>
                            <ChevronRight
                              size={12}
                              className={cn(
                                'text-[var(--text-faint)] transition-transform shrink-0',
                                subOpen && 'rotate-90'
                              )}
                            />
                          </button>
                        ) : (
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2.5 pl-6 pr-2 py-1.5 rounded-lg text-sm transition-colors',
                              childActive
                                ? 'text-[var(--accent)] font-medium bg-[var(--accent-soft)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                            )}
                          >
                            <span className="shrink-0">{child.icon}</span>
                            <span className="flex-1">{child.label}</span>
                            {child.badge !== undefined && (
                              <span className="text-[10px] font-semibold bg-[var(--accent)] text-white rounded-full px-1.5 py-px shrink-0">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        )}

                        {/* Sub-children */}
                        {hasSubs && subOpen && (
                          <div className="flex flex-col mt-0.5 mb-0.5">
                            {child.children!.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  'flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-lg text-[13px] transition-colors',
                                  isActive(sub.href)
                                    ? 'text-[var(--accent)] font-medium bg-[var(--accent-soft)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                                )}
                              >
                                <span className="shrink-0">{sub.icon}</span>
                                <span>{sub.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-1.5 border-t border-[var(--line)] shrink-0">
        <div
          className={cn(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group cursor-default',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center shrink-0">
            {USUARIO_LOGADO.iniciais}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[var(--text)] leading-none truncate mb-0.5">
                  {USUARIO_LOGADO.nome}
                </div>
                <div className="text-[10px] text-[var(--text-faint)] truncate">
                  {USUARIO_LOGADO.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--red)] transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
