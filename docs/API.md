# Documentação da API MDK

## Índice

1. [Rota de Teste](#rota-de-teste)
2. [Autenticação](#autenticação)
3. [Administradores](#administradores)
4. [Clientes](#clientes)
5. [Empréstimos](#empréstimos)
6. [Parcelas](#parcelas)
7. [Antecipação](#antecipação)
8. [Modelos de Mensagem](#modelos-de-mensagem)
9. [Webhook](#webhook)

---

## 1. Rota de Teste

### Testar se a API está online

```http
GET /api/teste
```

**Resposta de Sucesso (200):**

```json
{
  "status": "online",
  "nome": "API MDK",
  "versao": "1.0.0",
  "timestamp": "2024-05-01T12:00:00.000Z",
  "endpoints": {
    "docs": "/api/docs",
    "auth": "/api/auth",
    "clientes": "/api/clientes",
    "emprestimos": "/api/emprestimos",
    "parcelas": "/api/parcelas"
  },
  "mensagem": "API funcionando corretamente! Esta é uma rota de teste que não requer autenticação."
}
```

---

## 2. Autenticação

### Criar Primeiro Administrador

```http
POST /api/auth/admin/primeiro
Content-Type: application/json

{
  "nome": "Nome do Admin",
  "email": "admin@exemplo.com",
  "senha": "senha123"
}
```

### Login de Administrador

```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@exemplo.com",
  "senha": "senha123"
}
```

### Login de Cliente

```http
POST /api/auth/cliente/login
Content-Type: application/json

{
  "cpf": "12345678900",
  "senha": "123456" // Opcional
}
```

### Alterar Senha (Cliente)

```http
POST /api/auth/cliente/alterar-senha
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "senha_atual": "senha_atual",
  "nova_senha": "nova_senha"
}
```

---

## 3. Administradores

> Todas as rotas de administrador requerem o header de autenticação:
> `Authorization: Bearer seu_token_jwt`

### Listar Administradores

```http
GET /api/admin
```

### Buscar Administrador por ID

```http
GET /api/admin/:id
```

### Criar Novo Administrador

```http
POST /api/admin
Content-Type: application/json

{
  "nome": "Novo Admin",
  "email": "novo@exemplo.com",
  "senha": "senha123"
}
```

---

## 4. Clientes

### Listar Clientes

```http
GET /api/clientes
Authorization: Bearer seu_token_jwt
```

### Buscar Cliente por ID

```http
GET /api/clientes/:id
Authorization: Bearer seu_token_jwt
```

### Criar Cliente

```http
POST /api/clientes
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "nome": "Nome do Cliente",
  "cpf": "12345678900",
  "telefone": "11999999999"
}
```

### Atualizar Cliente

```http
PUT /api/clientes/:id
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "nome": "Novo Nome do Cliente",
  "email": "novo@email.com",
  "telefone": "11999999999",
  "endereco": "Nova Rua, 123",
  "carro": "Novo Modelo",
  "placa_carro": "ABC1234",
  "carro_alugado": true,
  "contrato_aluguel": "URL do contrato",
  "localizacao_residencial": "Coordenadas ou endereço",
  "comprovante_residencial": "URL do comprovante",
  "chave_pix": "chave@pix.com",
  "contato_familiar": "11988887777",
  "foto_documento_selfie": "URL da foto"
}
```

---

## 5. Empréstimos

### Listar Empréstimos

```http
GET /api/emprestimos
Authorization: Bearer seu_token_jwt
```

### Buscar Empréstimo por ID

```http
GET /api/emprestimos/:id
Authorization: Bearer seu_token_jwt
```

### Criar Empréstimo

```http
POST /api/emprestimos
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "id_cliente": 1,
  "valor_total": 1000.00,
  "quantidade_parcelas": 10,
  "notification_fds": false
}
```

---

## 6. Parcelas

### Listar Parcelas

```http
GET /api/parcelas
Authorization: Bearer seu_token_jwt
```

### Buscar Parcela por ID

```http
GET /api/parcelas/:id
Authorization: Bearer seu_token_jwt
```

---

## 7. Antecipação

### Antecipar Parcelas

```http
POST /api/antecipacao
Content-Type: application/json
Authorization: Bearer seu_token_jwt

{
  "id_emprestimo": 1,
  "numero_parcelas": 5 // Opcional
}
```

---

## 8. Modelos de Mensagem

### Buscar Modelo

```http
GET /api/modelos-mensagem/:tipo
Authorization: Bearer seu_token_jwt
```

---

## 9. Webhook

### Receber Notificações

```http
POST /api/webhook
Content-Type: application/json
access_token: seu_token_de_acesso

{
  // Payload específico do webhook
}
```

---

## Códigos de Erro

- **400** - Bad Request (dados inválidos ou faltando)
- **401** - Não autorizado (token não fornecido)
- **403** - Proibido (token inválido ou sem permissão)
- **404** - Não encontrado
- **500** - Erro interno do servidor

## Observações

1. Todas as rotas protegidas requerem o header `Authorization: Bearer seu_token_jwt`
2. O token JWT tem validade de 24 horas
3. As parcelas são agendadas apenas de segunda a sexta por padrão
4. Se `notification_fds` for true, as parcelas são agendadas de segunda a sábado
5. Domingos nunca têm notificações agendadas
6. A senha padrão do cliente é os 6 primeiros dígitos do CPF
