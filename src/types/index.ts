export interface Cnpj {
  id: string;
  nomeFantasia: string;
  razao: string;
  cnpj: string | null;
  tag: string;
  regime?: string;
  status?: 'ok' | 'warn' | 'err';
}

export interface Banco {
  id: string;
  nome: string;
  codigo: string;
  cor: string;
}

export interface ContaBancaria {
  id: string;
  cnpjId: string;
  bancoId: string;
  agencia: string;
  conta: string;
  apelido: string;
  tipo: string;
  saldo: number;
  ativo: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'despesa' | 'receita' | 'imposto' | 'transferencia' | 'ajuste' | 'outro';
  cnpjId: string;
  contaDebId: string;
  contaCredId: string;
  ativo: boolean;
  ops: number;
}

export interface ContaContabil {
  id: string;
  codigo: string;
  nome: string;
  natureza: 'debito' | 'credito';
  tipo: string;
  cnpjId: string;
  ativo: boolean;
}

export type MovStatus =
  | 'pendente'
  | 'sugerido'
  | 'conciliado'
  | 'divergente'
  | 'ignorado'
  | 'revisar';

export interface Movimentacao {
  id: string;
  cnpjId: string;
  contaBancariaId: string;
  data: string;
  tipo: 'debito' | 'credito';
  valor: number;
  descricaoOFX: string;
  categoria?: string | null;
  categoriaId?: string | null;
  contaDebId?: string | null;
  contaCredId?: string | null;
  status: MovStatus;
  regraId?: string | null;
  confianca?: number | null;
  doc?: string | null;
  usuario?: string | null;
  hora?: string | null;
}

export interface Regra {
  id: string;
  nome: string;
  cnpjId: string;
  contaBancariaId: string;
  keywords: string[];
  tipoMov: 'debito' | 'credito' | 'ambos';
  valorMin: number;
  valorMax: number | null;
  periodicidade: string;
  categoriaId: string;
  confianca: number;
  ativo: boolean;
  hits: number;
}

export interface ArquivoOFX {
  id: string;
  nome: string;
  contaBancariaId: string;
  periodo: string;
  movimentos: number;
  dataImport: string;
  usuario: string;
  status: string;
}
