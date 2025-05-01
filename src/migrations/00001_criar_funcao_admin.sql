-- Criar função para criar tabela de administradores
CREATE OR REPLACE FUNCTION criar_tabela_administradores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar tabela se não existir
  CREATE TABLE IF NOT EXISTS administradores (
    id_admin SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Criar índice se não existir
  CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);
END;
$$; 