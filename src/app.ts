import express from "express";
import webhookRouter from "./routes/webhook";
import antecipacaoRouter from "./routes/antecipacao";
import authRouter from "./routes/auth";

const app = express();
app.use(express.json());

app.use("/webhook", webhookRouter);
app.use("/antecipacao", antecipacaoRouter);
app.use("/auth", authRouter);

export default app;
