import express from "express";
import { clienteService } from "../services/supabase";
import multer from "multer";
import path from "path";
import { supabase } from "../config/supabase";

const router = express.Router();

// Configuração do multer para arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
router.post(
  "/",
  upload.fields([
    { name: "contrato_aluguel", maxCount: 1 },
    { name: "comprovante_residencial", maxCount: 1 },
    { name: "foto_documento_selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body;
      const files = req.files as Record<string, Express.Multer.File[]>;
      const fileFields = [
        "contrato_aluguel",
        "comprovante_residencial",
        "foto_documento_selfie",
      ];
      // Upload dos arquivos para o Supabase Storage
      for (const field of fileFields) {
        if (files && files[field] && files[field][0]) {
          const file = files[field][0];
          const ext = path.extname(file.originalname) || ".bin";
          const fileName = `${field}_${Date.now()}${ext}`;
          const { data, error } = await supabase.storage
            .from("clientes")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            });
          if (error) {
            return res
              .status(500)
              .json({ error: `Erro ao fazer upload de ${field}` });
          }
          // Gerar URL pública
          const { data: publicUrl } = supabase.storage
            .from("clientes")
            .getPublicUrl(fileName);
          body[field] = publicUrl.publicUrl;
        }
      }
      const cliente = await clienteService.criarCliente(body);
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
  }
);

// Atualizar cliente
router.put(
  "/:id",
  upload.fields([
    { name: "contrato_aluguel", maxCount: 1 },
    { name: "comprovante_residencial", maxCount: 1 },
    { name: "foto_documento_selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body;
      const files = req.files as Record<string, Express.Multer.File[]>;
      const fileFields = [
        "contrato_aluguel",
        "comprovante_residencial",
        "foto_documento_selfie",
      ];
      // Upload dos arquivos para o Supabase Storage
      for (const field of fileFields) {
        if (files && files[field] && files[field][0]) {
          const file = files[field][0];
          const ext = path.extname(file.originalname) || ".bin";
          const fileName = `${field}_${Date.now()}${ext}`;
          const { data, error } = await supabase.storage
            .from("clientes")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            });
          if (error) {
            return res
              .status(500)
              .json({ error: `Erro ao fazer upload de ${field}` });
          }
          // Gerar URL pública
          const { data: publicUrl } = supabase.storage
            .from("clientes")
            .getPublicUrl(fileName);
          body[field] = publicUrl.publicUrl;
        }
      }
      const cliente = await clienteService.atualizarCliente(
        Number(req.params.id),
        body
      );
      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar cliente" });
    }
  }
);

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
