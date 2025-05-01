import express from "express";
import { modelosMensagemService } from "../services/modelosMensagem";

const router = express.Router();

// Buscar modelo de mensagem
router.get("/:tipo", async (req, res) => {
  try {
    const conteudo = await modelosMensagemService.getModelo(req.params.tipo);
    res.json({ conteudo });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar modelo" });
  }
});

// Atualizar modelo de mensagem
router.put("/:tipo", async (req, res) => {
  try {
    const { conteudo } = req.body;
    if (!conteudo)
      return res.status(400).json({ error: "Conteúdo obrigatório" });
    const data = await modelosMensagemService.setModelo(
      req.params.tipo,
      conteudo
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar modelo" });
  }
});

export default router;
