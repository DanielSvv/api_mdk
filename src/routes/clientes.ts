import express from "express";
import { clienteService } from "../services/supabase";

const router = express.Router();

// Listar todos os clientes
router.get("/", async (req, res) => {
  try {
    const clientes = await clienteService.listarClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
});

// Buscar cliente por CPF
router.get("/cpf/:cpf", async (req, res) => {
  try {
    const cliente = await clienteService.buscarClientePorCpf(req.params.cpf);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cliente por CPF" });
  }
});

// Buscar cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const cliente = await clienteService.buscarClientePorId(
      Number(req.params.id)
    );
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    // Buscar empréstimos do cliente
    const { emprestimoService } = require("../services/supabase");
    const emprestimos = await emprestimoService.listarEmprestimosPorCliente(
      Number(req.params.id)
    );
    res.json({ ...cliente, emprestimos });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

// Criar cliente
router.post("/", async (req, res) => {
  try {
    const cliente = await clienteService.criarCliente(req.body);
    res.status(201).json(cliente);
  } catch (error: any) {
    if (error.message === "Cliente duplicado") {
      return res.status(409).json({ error: "Cliente duplicado" });
    }
    return res.status(500).json({
      error: "Erro ao criar cliente",
      detalhe: error.message || error.toString(),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Atualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const cliente = await clienteService.atualizarCliente(
      Number(req.params.id),
      req.body
    );
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

// Deletar cliente
router.delete("/:id", async (req, res) => {
  try {
    await clienteService.deletarCliente(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
});

export default router;
