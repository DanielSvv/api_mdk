import express from "express";
import { parcelaService } from "../services/supabase";

const router = express.Router();

// Listar todas as parcelas
router.get("/", async (req, res) => {
  try {
    const parcelas = await parcelaService.listarParcelas();
    res.json(parcelas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar parcelas" });
  }
});

// Buscar parcela por ID
router.get("/:id", async (req, res) => {
  try {
    const parcela = await parcelaService.buscarParcelaPorId(
      Number(req.params.id)
    );
    if (!parcela) {
      return res.status(404).json({ error: "Parcela não encontrada" });
    }
    res.json(parcela);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcela" });
  }
});

// Criar parcela
router.post("/", async (req, res) => {
  try {
    const parcela = await parcelaService.criarParcela(req.body);
    res.status(201).json(parcela);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar parcela" });
  }
});

// Atualizar parcela
router.put("/:id", async (req, res) => {
  try {
    const parcela = await parcelaService.atualizarParcela(
      Number(req.params.id),
      req.body
    );
    if (!parcela) {
      return res.status(404).json({ error: "Parcela não encontrada" });
    }
    res.json(parcela);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar parcela" });
  }
});

export default router;
