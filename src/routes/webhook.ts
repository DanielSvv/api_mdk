import express from "express";
import axios from "axios";
import { createCanvas } from "canvas";
import { clienteService } from "../services/supabase";
// Importe o supabase se quiser buscar dados reais
// import { supabase } from "../services/supabase";

const router = express.Router();

const ACCESS_TOKEN =
  "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRjZGRlOGJhLTAyMTktNDc1Yi1hNzdiLTFiMDA0Y2VmNjUyNDo6JGFhY2hfZjE1Y2Q0ZDctNTJkYi00MTNiLTllMjEtZGEyNjM0Nzg0ZTdm";

// Middleware para verificar o token
const verificarToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers["access_token"] as string;

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  if (token !== ACCESS_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
};

// Aplicar middleware de verificação de token em todas as rotas
router.use(verificarToken);

const whatsappApiUrl =
  "https://evolutionapi-evolution-api.pqfhfk.easypanel.host/message/sendMedia/Mdk";
const whatsappApiKey = "677BF5E74665-4E65-BA83-EF48D2111BB3";

// Função para gerar imagem de comprovante personalizada
async function gerarComprovanteImagem({
  nome,
  telefone,
  valor,
  parcela,
  totalPago,
  formaPagamento,
  dataPagamento,
  contato,
}: {
  nome: string;
  telefone: string;
  valor: number;
  parcela: number;
  totalPago: number;
  formaPagamento: string;
  dataPagamento: string;
  contato: string;
}): Promise<Buffer> {
  const canvas = createCanvas(600, 340);
  const ctx = canvas.getContext("2d");

  // Fundo branco
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 600, 340);

  // Linhas tracejadas
  ctx.strokeStyle = "#888";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.lineTo(590, 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 60);
  ctx.lineTo(590, 60);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 100);
  ctx.lineTo(590, 100);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 130);
  ctx.lineTo(590, 130);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 200);
  ctx.lineTo(590, 200);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 250);
  ctx.lineTo(590, 250);
  ctx.stroke();

  ctx.setLineDash([]);

  // Cabeçalho
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#222";
  ctx.fillText("MDK CRÉDITO RÁPIDO ", 300, 25);

  // Contato
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Contato: ${contato}`, 20, 50);

  // Cliente
  ctx.font = "14px Arial";
  ctx.fillText(`Cliente ${nome} Tel: ${telefone}`, 20, 80);

  // Recibo
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("RECIBO DE PAGAMENTO", 300, 115);

  // Dados da parcela e valor
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Parcela ${parcela}`, 20, 150);
  ctx.fillText(`R$ ${valor.toFixed(2)}`, 200, 150);

  // Total pago
  ctx.fillText(`Total Pago`, 20, 180);
  ctx.font = "bold 14px Arial";
  ctx.fillText(`R$ ${totalPago.toFixed(2)}`, 200, 180);

  // Forma de pagamento
  ctx.font = "14px Arial";
  ctx.fillText(`Forma de Pagamento`, 20, 220);
  ctx.fillText(formaPagamento, 200, 220);

  // Formatar data para DD/MM/YYYY
  let dataFormatada = dataPagamento;
  if (dataPagamento) {
    const dataObj = new Date(dataPagamento);
    if (!isNaN(dataObj.getTime())) {
      const dia = String(dataObj.getDate()).padStart(2, "0");
      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      const ano = dataObj.getFullYear();
      dataFormatada = `${dia}/${mes}/${ano}`;
    }
  }
  ctx.fillText(`Data Pagamento: ${dataFormatada}`, 20, 270);

  return canvas.toBuffer("image/png");
}

router.post("/", async (req, res) => {
  try {
    const { payment } = req.body;
    const asaasId = payment.customer;
    // Buscar cliente pelo asaas_id
    const { data: cliente, error } =
      await clienteService.buscarClientePorAsaasId(asaasId);
    if (error || !cliente) {
      throw new Error("Cliente não encontrado pelo asaas_id");
    }
    const nome = cliente.nome || "Cliente";
    const telefone = cliente.telefone;
    const valor = payment.value;
    const parcela = payment.installmentNumber || 1;
    const totalPago = payment.value;
    const formaPagamento = payment.billingType || "Pix";
    const dataPagamento = payment.paymentDate || payment.confirmedDate || "";
    const contato = "(61) 99822-1746"; // Pode ajustar conforme necessário

    const buffer = await gerarComprovanteImagem({
      nome,
      telefone,
      valor,
      parcela,
      totalPago,
      formaPagamento,
      dataPagamento,
      contato,
    });
    const base64Image = buffer.toString("base64");

    const payload = {
      number: telefone,
      mediatype: "image",
      mimetype: "image/png",
      caption: "Segue o comprovante do seu pagamento. Obrigado!",
      text: "Segue o comprovante do seu pagamento. Obrigado!",
      media: base64Image,
      fileName: "Comprovante.png",
      delay: 0,
      mentionsEveryOne: false,
      mentioned: [telefone],
    };

    await axios.post(whatsappApiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        apikey: whatsappApiKey,
      },
    });

    // Atualizar status da parcela para 'pago'
    const { supabase } = require("../services/supabase");
    await supabase
      .from("parcelas")
      .update({ status_pagamento: "pago" })
      .eq("numero_parcela", parcela)
      .eq(
        "id_emprestimo",
        payment.installment ||
          payment.installmentId ||
          payment.id_emprestimo ||
          null
      );

    // Verificar se todas as parcelas do empréstimo estão pagas
    const idEmprestimo =
      payment.installment ||
      payment.installmentId ||
      payment.id_emprestimo ||
      null;
    if (idEmprestimo) {
      const { data: parcelasRestantes, error: errorParcelasRestantes } =
        await supabase
          .from("parcelas")
          .select("id_parcela")
          .eq("id_emprestimo", idEmprestimo)
          .not("status_pagamento", "eq", "pago");
      if (
        !errorParcelasRestantes &&
        parcelasRestantes &&
        parcelasRestantes.length === 0
      ) {
        // Todas as parcelas estão pagas, atualizar status do empréstimo
        await supabase
          .from("emprestimos")
          .update({ status_emprestimo: "pago" })
          .eq("id_emprestimo", idEmprestimo);
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Comprovante enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar comprovante:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao enviar comprovante" });
  }
});

export default router;
