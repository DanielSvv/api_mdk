# API MDK Soluções

API REST desenvolvida em Node.js com TypeScript para gerenciamento de empréstimos.

## Funcionalidades

- Autenticação de administradores e clientes
- Gerenciamento de clientes
- Gerenciamento de empréstimos
- Gerenciamento de parcelas
- Integração com Asaas para pagamentos
- Notificações via WhatsApp
- Sistema de antecipação de parcelas

## Tecnologias

- Node.js
- TypeScript
- Express
- Supabase
- Asaas API
- WhatsApp API

## Requisitos

- Node.js 18+
- NPM ou Yarn
- Conta no Supabase
- Conta no Asaas
- Acesso à API do WhatsApp

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/mdk-api.git
cd mdk-api
```

2. Instale as dependências:

```bash
npm install
# ou
yarn
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase

# WhatsApp API
WHATSAPP_API_URL=sua_url_da_api_whatsapp
WHATSAPP_API_KEY=sua_chave_da_api_whatsapp
```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

## Build

Para gerar o build de produção:

```bash
npm run build
# ou
yarn build
```

## Produção

Para iniciar o servidor em produção:

```bash
npm start
# ou
yarn start
```

## Documentação da API

A documentação completa da API está disponível no arquivo [docs/API.md](docs/API.md).

## Estrutura do Projeto

```
src/
  ├── routes/         # Rotas da API
  ├── services/       # Serviços e integrações
  ├── types/          # Definições de tipos TypeScript
  ├── server.ts       # Configuração do servidor
  └── index.ts        # Ponto de entrada da aplicação
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
