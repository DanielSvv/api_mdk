import express from "express";
import { supabase } from "../services/supabase";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

// Função para gerar token JWT
const gerarToken = (id: string | number, tipo: "admin" | "cliente") => {
  return jwt.sign({ id, tipo }, JWT_SECRET, { expiresIn: "24h" });
};

// Função para validar CPF
const validarCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]/g, "");
  if (cpf.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Login de administrador
router.post("/admin/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const { data: admin, error } = await supabase
      .from("administradores")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaCorreta = await bcrypt.compare(senha, admin.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = gerarToken(admin.id_admin, "admin");

    res.json({
      success: true,
      token,
      usuario: {
        id: admin.id_admin,
        nome: admin.nome,
        email: admin.email,
        tipo: "admin",
      },
    });
  } catch (error) {
    console.error("Erro no login de administrador:", error);
    res.status(500).json({ error: "Erro ao processar login" });
  }
});

// Login de cliente
router.post("/cliente/login", async (req, res) => {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({ error: "CPF é obrigatório" });
    }

    const cpfLimpo = cpf.replace(/[^\d]/g, "");
    if (!validarCPF(cpfLimpo)) {
      return res.status(400).json({ error: "CPF inválido" });
    }

    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("cpf", cpfLimpo)
      .single();

    if (error || !cliente) {
      return res.status(401).json({ error: "Cliente não encontrado" });
    }

    // Senha padrão: 6 primeiros dígitos do CPF
    const senhaPadrao = cpfLimpo.substring(0, 6);

    // Se a senha ainda não foi definida, define a senha padrão
    if (!cliente.senha) {
      const senhaHash = await bcrypt.hash(senhaPadrao, 10);
      await supabase
        .from("clientes")
        .update({ senha: senhaHash })
        .eq("id_cliente", cliente.id_cliente);
    }

    // Verifica a senha (seja a padrão ou a já definida)
    const senhaCorreta = await bcrypt.compare(
      req.body.senha || senhaPadrao,
      cliente.senha || (await bcrypt.hash(senhaPadrao, 10))
    );

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = gerarToken(cliente.id_cliente, "cliente");

    res.json({
      success: true,
      token,
      usuario: {
        id: cliente.id_cliente,
        nome: cliente.nome,
        cpf: cliente.cpf,
        tipo: "cliente",
      },
    });
  } catch (error) {
    console.error("Erro no login de cliente:", error);
    res.status(500).json({ error: "Erro ao processar login" });
  }
});

// Criar novo administrador (protegido por token de admin)
router.post("/admin/criar", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        tipo: string;
      };
      if (decoded.tipo !== "admin") {
        return res.status(403).json({ error: "Acesso não autorizado" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const { data: novoAdmin, error } = await supabase
      .from("administradores")
      .insert({
        nome,
        email: email.toLowerCase(),
        senha: senhaHash,
      })
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes("unique constraint")) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      throw error;
    }

    res.json({
      success: true,
      message: "Administrador criado com sucesso",
      admin: {
        id: novoAdmin.id_admin,
        nome: novoAdmin.nome,
        email: novoAdmin.email,
      },
    });
  } catch (error) {
    console.error("Erro ao criar administrador:", error);
    res.status(500).json({ error: "Erro ao criar administrador" });
  }
});

// Alterar senha (cliente)
router.post("/cliente/alterar-senha", async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        tipo: string;
      };
      if (decoded.tipo !== "cliente") {
        return res.status(403).json({ error: "Acesso não autorizado" });
      }

      const { data: cliente, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id_cliente", decoded.id)
        .single();

      if (error || !cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      const senhaCorreta = await bcrypt.compare(senha_atual, cliente.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ error: "Senha atual incorreta" });
      }

      const novaSenhaHash = await bcrypt.hash(nova_senha, 10);
      await supabase
        .from("clientes")
        .update({ senha: novaSenhaHash })
        .eq("id_cliente", decoded.id);

      res.json({
        success: true,
        message: "Senha alterada com sucesso",
      });
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

// Criar primeiro administrador (só funciona se não existir nenhum admin)
router.post("/admin/primeiro", async (req, res) => {
  console.log("Iniciando criação do primeiro admin");
  try {
    const { nome, email, senha } = req.body;
    console.log("Dados recebidos:", { nome, email, temSenha: !!senha });

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Todos os campos são obrigatórios",
        detalhes: {
          nome: !nome ? "Nome é obrigatório" : null,
          email: !email ? "Email é obrigatório" : null,
          senha: !senha ? "Senha é obrigatória" : null,
        },
      });
    }

    // Criar hash da senha
    console.log("Criando hash da senha...");
    const senhaHash = await bcrypt.hash(senha, 10);

    // Tentar inserir o admin diretamente
    console.log("Tentando inserir admin...");
    const { data: novoAdmin, error: insertError } = await supabase
      .from("administradores")
      .insert({
        nome,
        email: email.toLowerCase(),
        senha: senhaHash,
        data_criacao: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro na inserção - Detalhes completos:", {
        error: insertError,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        message: insertError.message,
      });

      // Se o erro for porque a tabela não existe, retornamos um erro mais amigável
      if (insertError.code === "42P01") {
        // código para "relation does not exist"
        return res.status(500).json({
          error: "Sistema não inicializado corretamente",
          message:
            "A estrutura do banco de dados precisa ser criada primeiro. Por favor, execute as migrações iniciais.",
        });
      }

      if (insertError.message?.includes("unique constraint")) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      throw insertError;
    }

    if (!novoAdmin) {
      throw new Error("Admin não foi criado corretamente");
    }

    console.log("Gerando token...");
    const token = gerarToken(novoAdmin.id_admin, "admin");

    console.log("Enviando resposta...");
    return res.status(201).json({
      success: true,
      message: "Primeiro administrador criado com sucesso",
      admin: {
        id: novoAdmin.id_admin,
        nome: novoAdmin.nome,
        email: novoAdmin.email,
      },
      token,
    });
  } catch (error) {
    console.error("Erro ao criar primeiro administrador:", error);
    if (error instanceof Error) {
      console.error("Detalhes do erro:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return res.status(500).json({
      error: "Erro ao criar administrador",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

// Rota de teste
router.get("/teste", (req, res) => {
  res.json({ message: "Servidor de autenticação funcionando!" });
});

export default router;
