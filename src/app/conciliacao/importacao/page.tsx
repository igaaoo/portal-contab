'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Clock,
  X,
  Download,
  Eye,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AppShell } from '@/components/layout/AppShell';
import { ARQUIVOS_OFX, CONTAS_BANCARIAS, BANCOS, CNPJS } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function ImportacaoPage() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState(ARQUIVOS_OFX);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  const totalMovimentos = files.reduce((s, f) => s + f.movimentos, 0);

  return (
    <AppShell title="Importação OFX">
      <div className="p-5 space-y-5 ">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Importação OFX</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Importe extratos bancários no formato OFX
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all',
            dragging
              ? 'border-[var(--accent)] bg-[var(--accent-soft)]/30'
              : 'border-[var(--line-strong)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]'
          )}
        >
          <input ref={fileRef} type="file" accept=".ofx" multiple className="hidden" />
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors',
            dragging ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-sunken)] text-[var(--accent)]'
          )}>
            <Upload size={24} />
          </div>
          <h3 className="font-semibold text-[var(--text)] mb-1">
            {dragging ? 'Solte aqui para importar' : 'Arraste arquivos OFX ou clique para selecionar'}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Formato OFX — múltiplos arquivos aceitos
          </p>
          <Button variant="primary" size="md" className="mt-4" icon={<Upload size={14} />}>
            Selecionar Arquivos
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--text)]">{files.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Arquivos importados</div>
          </div>
          <div className="bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--green)]">{totalMovimentos}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Movimentos processados</div>
          </div>
          <div className="bg-[var(--bg-elev)] border border-[var(--line)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[var(--accent)]">
              {files.filter((f) => f.status === 'processado').length}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Com sucesso</div>
          </div>
        </div>

        {/* File list */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
            <span className="font-semibold text-sm text-[var(--text)]">Extratos Importados</span>
            <Badge color="green" dot>{files.length} processados</Badge>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {files.map((arquivo) => {
              const conta = CONTAS_BANCARIAS.find((c) => c.id === arquivo.contaBancariaId);
              const banco = conta ? BANCOS.find((b) => b.id === conta.bancoId) : null;
              const cnpjInfo = conta ? CNPJS.find((c) => c.id === conta.cnpjId) : null;

              return (
                <div
                  key={arquivo.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-sunken)] flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-[var(--accent)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[var(--text)] truncate font-mono text-xs">
                        {arquivo.nome}
                      </span>
                      <Badge color={arquivo.status === 'processado' ? 'green' : 'amber'} dot>
                        {arquivo.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {banco && (
                        <span className="flex items-center gap-1 text-xs text-[var(--text-faint)]">
                          <span
                            className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[9px] font-bold"
                            style={{ backgroundColor: banco.cor }}
                          >
                            {banco.codigo}
                          </span>
                          {conta?.apelido}
                        </span>
                      )}
                      {cnpjInfo && (
                        <span className="flex items-center gap-1 text-xs text-[var(--text-faint)]">
                          <Building2 size={10} />
                          {cnpjInfo.tag}
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-faint)]">
                        {arquivo.periodo}
                      </span>
                    </div>
                  </div>

                  <div className="text-center shrink-0">
                    <div className="text-sm font-semibold text-[var(--text)]">{arquivo.movimentos}</div>
                    <div className="text-[10px] text-[var(--text-faint)]">movimentos</div>
                  </div>

                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-xs text-[var(--text-muted)]">{arquivo.usuario}</div>
                    <div className="text-[10px] text-[var(--text-faint)]">{arquivo.dataImport}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--text)] cursor-pointer transition-colors">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-faint)] hover:text-[var(--text)] cursor-pointer transition-colors">
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => setFiles((prev) => prev.filter((f) => f.id !== arquivo.id))}
                      className="p-1.5 rounded hover:bg-[var(--red-bg)] text-[var(--text-faint)] hover:text-[var(--red)] cursor-pointer transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 bg-[var(--blue-bg)] rounded-xl border border-[var(--blue)]/20">
          <Clock size={15} className="text-[var(--blue)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--blue)]">
            <strong>Processamento automático:</strong> Após importar, o sistema sugere categorias automaticamente usando regras cadastradas e IA. Acesse o Conciliador para revisar as sugestões.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
