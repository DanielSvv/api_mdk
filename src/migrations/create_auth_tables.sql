-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS administradores (
    id_admin SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca por email
CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);

-- Adicionar campos de autenticação na tabela de clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(11) UNIQUE,
ADD COLUMN IF NOT EXISTS senha VARCHAR(255);

-- Criar índice para busca por CPF
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);

-- Criar enum para tipo de usuário
CREATE TYPE IF NOT EXISTS tipo_usuario AS ENUM ('admin', 'cliente'); 