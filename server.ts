import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./src/scheduler/parcelas";

import clientesRoutes from "./src/routes/clientes";
import emprestimosRoutes from "./src/routes/emprestimos";
import parcelasRoutes from "./src/routes/parcelas";
import modelosMensagemRoutes from "./src/routes/modelosMensagem";
import webhookRouter from "./src/routes/webhook";
import authRouter from "./src/routes/auth";
import adminRouter from "./src/routes/admin";
import testeRouter from "./src/routes/teste";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/teste", testeRouter); // Nova rota de teste (sem autenticação)
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/clientes", clientesRoutes);
app.use("/api/emprestimos", emprestimosRoutes);
app.use("/api/parcelas", parcelasRoutes);
app.use("/api/modelos-mensagem", modelosMensagemRoutes);
app.use("/api/webhook", webhookRouter);

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API funcionando!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
