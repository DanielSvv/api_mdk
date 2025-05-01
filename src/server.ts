import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./scheduler/parcelas";

import clientesRoutes from "./routes/clientes";
import emprestimosRoutes from "./routes/emprestimos";
import parcelasRoutes from "./routes/parcelas";
import modelosMensagemRoutes from "./routes/modelosMensagem";
import webhookRouter from "./routes/webhook";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
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
