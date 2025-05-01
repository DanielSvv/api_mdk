-- Criar enum para tipo de usuário
CREATE TYPE IF NOT EXISTS tipo_usuario AS ENUM ('admin', 'cliente');

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

-- Criar tabela de clientes (se ainda não existir)
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    senha VARCHAR(255),
    telefone VARCHAR(20),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para busca por CPF
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf); 