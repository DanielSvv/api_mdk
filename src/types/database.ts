export interface Cliente {
  id_cliente: number;
  nome: string | null;
  email: string | null;
  cpf: string | null;
  endereco: string | null;
  carro: string | null;
  placa_carro: string | null;
  carro_alugado: boolean | null;
  contrato_aluguel: string | null;
  localizacao_residencial: string | null;
  comprovante_residencial: string | null;
  chave_pix: string | null;
  contato_familiar: string | null;
  foto_documento_selfie: string | null;
  data_criacao: string | null;
  status_cliente: string | null;
}

export interface Emprestimo {
  id_emprestimo: number;
  id_cliente: number | null;
  valor_emprestimo: number | null;
  data_emprestimo: string | null;
  taxa_juros: number | null;
  status_emprestimo: string | null;
  data_criacao: string | null;
}

export interface Parcela {
  id_parcela: number;
  id_emprestimo: number | null;
  numero_parcela: number | null;
  valor_parcela: number | null;
  data_vencimento: string | null;
  status_pagamento: string | null;
  data_pagamento: string | null;
  data_criacao: string | null;
  notification_fds?: boolean;
}

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          id_cliente: number;
          nome: string | null;
          cpf: string | null;
          email: string | null;
          telefone: string | null;
          endereco: string | null;
          carro: string | null;
          placa_carro: string | null;
          carro_alugado: boolean | null;
          contrato_aluguel: string | null;
          localizacao_residencial: string | null;
          comprovante_residencial: string | null;
          chave_pix: string | null;
          contato_familiar: string | null;
          foto_documento_selfie: string | null;
          status_cliente: string | null;
          data_criacao: string | null;
          asaas_id: string | null;
        };
        Insert: {
          id_cliente?: number;
          nome?: string | null;
          cpf?: string | null;
          email?: string | null;
          telefone?: string | null;
          endereco?: string | null;
          carro?: string | null;
          placa_carro?: string | null;
          carro_alugado?: boolean | null;
          contrato_aluguel?: string | null;
          localizacao_residencial?: string | null;
          comprovante_residencial?: string | null;
          chave_pix?: string | null;
          contato_familiar?: string | null;
          foto_documento_selfie?: string | null;
          status_cliente?: string | null;
          data_criacao?: string | null;
          asaas_id?: string | null;
        };
        Update: {
          id_cliente?: number;
          nome?: string | null;
          cpf?: string | null;
          email?: string | null;
          telefone?: string | null;
          endereco?: string | null;
          carro?: string | null;
          placa_carro?: string | null;
          carro_alugado?: boolean | null;
          contrato_aluguel?: string | null;
          localizacao_residencial?: string | null;
          comprovante_residencial?: string | null;
          chave_pix?: string | null;
          contato_familiar?: string | null;
          foto_documento_selfie?: string | null;
          status_cliente?: string | null;
          data_criacao?: string | null;
          asaas_id?: string | null;
        };
      };
      emprestimos: {
        Row: {
          id_emprestimo: number;
          id_cliente: number | null;
          valor_emprestimo: number | null;
          data_emprestimo: string | null;
          taxa_juros: number | null;
          status_emprestimo: string | null;
          data_criacao: string | null;
        };
        Insert: {
          id_emprestimo?: number;
          id_cliente?: number | null;
          valor_emprestimo?: number | null;
          data_emprestimo?: string | null;
          taxa_juros?: number | null;
          status_emprestimo?: string | null;
          data_criacao?: string | null;
        };
        Update: {
          id_emprestimo?: number;
          id_cliente?: number | null;
          valor_emprestimo?: number | null;
          data_emprestimo?: string | null;
          taxa_juros?: number | null;
          status_emprestimo?: string | null;
          data_criacao?: string | null;
        };
      };
      parcelas: {
        Row: {
          id_parcela: number;
          id_emprestimo: number | null;
          numero_parcela: number | null;
          valor_parcela: number | null;
          data_vencimento: string | null;
          status_pagamento: string | null;
          data_pagamento: string | null;
          data_criacao: string | null;
          notification_fds: boolean | null;
          asaas_payment_id: string | null;
          pix_payload: string | null;
        };
        Insert: {
          id_parcela?: number;
          id_emprestimo?: number | null;
          numero_parcela?: number | null;
          valor_parcela?: number | null;
          data_vencimento?: string | null;
          status_pagamento?: string | null;
          data_pagamento?: string | null;
          data_criacao?: string | null;
          notification_fds?: boolean | null;
          asaas_payment_id?: string | null;
          pix_payload?: string | null;
        };
        Update: {
          id_parcela?: number;
          id_emprestimo?: number | null;
          numero_parcela?: number | null;
          valor_parcela?: number | null;
          data_vencimento?: string | null;
          status_pagamento?: string | null;
          data_pagamento?: string | null;
          data_criacao?: string | null;
          notification_fds?: boolean | null;
          asaas_payment_id?: string | null;
          pix_payload?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
