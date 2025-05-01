import express from "express";
import { adminService } from "../services/admin";
import {
  verificarToken,
  verificarAdmin,
  AuthRequest,
} from "../middlewares/auth";

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas (exceto login e primeiro admin)
router.use(verificarToken);
router.use(verificarAdmin);

// Criar novo administrador
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const admin = await adminService.criarAdmin({ nome, email, senha });

    res.status(201).json({
      success: true,
      message: "Administrador criado com sucesso",
      admin,
    });
  } catch (error: any) {
    console.error("Erro ao criar administrador:", error);
    if (error.message === "Email já cadastrado") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao criar administrador" });
  }
});

// Listar todos os administradores
router.get("/", async (req: AuthRequest, res) => {
  try {
    const admins = await adminService.listarAdministradores();
    res.json(admins);
  } catch (error) {
    console.error("Erro ao listar administradores:", error);
    res.status(500).json({ error: "Erro ao listar administradores" });
  }
});

// Buscar administrador por ID
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const admin = await adminService.buscarAdminPorId(Number(req.params.id));
    if (!admin) {
      return res.status(404).json({ error: "Administrador não encontrado" });
    }
    res.json(admin);
  } catch (error) {
    console.error("Erro ao buscar administrador:", error);
    res.status(500).json({ error: "Erro ao buscar administrador" });
  }
});

// Atualizar dados do administrador
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { nome, email } = req.body;
    if (!nome && !email) {
      return res.status(400).json({ error: "Nenhum dado para atualizar" });
    }

    const admin = await adminService.atualizarAdmin(Number(req.params.id), {
      nome,
      email,
    });

    res.json({
      success: true,
      message: "Administrador atualizado com sucesso",
      admin,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar administrador:", error);
    if (error.message === "Email já cadastrado") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao atualizar administrador" });
  }
});

// Alterar senha do administrador
router.post("/:id/alterar-senha", async (req: AuthRequest, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) {
      return res
        .status(400)
        .json({ error: "Senha atual e nova senha são obrigatórias" });
    }

    await adminService.alterarSenhaAdmin(
      Number(req.params.id),
      senha_atual,
      nova_senha
    );

    res.json({
      success: true,
      message: "Senha alterada com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error);
    if (error.message === "Senha atual incorreta") {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

// Excluir administrador
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await adminService.excluirAdmin(Number(req.params.id));
    res.json({
      success: true,
      message: "Administrador excluído com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao excluir administrador:", error);
    if (error.message === "Não é possível excluir o último administrador") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao excluir administrador" });
  }
});

export default router;
