import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const info = {
    status: "online",
    nome: "API MDK",
    versao: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      docs: "/api/docs",
      auth: "/api/auth",
      clientes: "/api/clientes",
      emprestimos: "/api/emprestimos",
      parcelas: "/api/parcelas",
    },
    mensagem:
      "API funcionando corretamente! Esta é uma rota de teste que não requer autenticação.",
  };

  res.json(info);
});

export default router;
