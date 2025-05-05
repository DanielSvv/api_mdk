import express from "express";
import { emprestimoService } from "../services/supabase";

const router = express.Router();

// Listar todos os empréstimos
router.get("/", async (req, res) => {
  try {
    const status_emprestimo = req.query.status_emprestimo as string | undefined;
    const emprestimos = await emprestimoService.listarEmprestimos(
      status_emprestimo
    );
    res.json(emprestimos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar empréstimos" });
  }
});

// Buscar empréstimo por ID
router.get("/:id", async (req, res) => {
  try {
    const emprestimo = await emprestimoService.buscarEmprestimoPorId(
      Number(req.params.id)
    );
    if (!emprestimo) {
      return res.status(404).json({ error: "Empréstimo não encontrado" });
    }
    res.json(emprestimo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar empréstimo" });
  }
});

// Criar empréstimo
router.post("/", async (req, res) => {
  try {
    const {
      id_cliente,
      valor_emprestimo,
      quantidade_parcelas,
      taxa_juros,
      status_emprestimo,
      notification_fds,
    } = req.body;
    if (!id_cliente || !valor_emprestimo || !quantidade_parcelas) {
      return res.status(400).json({
        error:
          "Campos obrigatórios: id_cliente, valor_emprestimo, quantidade_parcelas",
      });
    }
    const emprestimo = await emprestimoService.criarEmprestimo({
      id_cliente,
      valor_emprestimo,
      quantidade_parcelas,
      taxa_juros: taxa_juros || null,
      status_emprestimo: status_emprestimo || "ativo",
      data_emprestimo: new Date().toISOString().split("T")[0],
      notification_fds,
    });
    res.status(201).json(emprestimo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar empréstimo" });
  }
});

// Cancelar empréstimo e parcelas
router.post("/:id/cancelar", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "ID do empréstimo é obrigatório" });
    }
    await emprestimoService.cancelarEmprestimo(id);
    res.json({ message: "Empréstimo e parcelas cancelados com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cancelar empréstimo" });
  }
});

export default router;
