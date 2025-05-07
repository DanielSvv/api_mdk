import express from "express";
import axios from "axios";
import PDFDocument from "pdfkit";
import { clienteService } from "../services/supabase";
// Importe o supabase se quiser buscar dados reais
// import { supabase } from "../services/supabase";

const router = express.Router();

const whatsappApiUrl =
  "https://evolutionapi-evolution-api.pqfhfk.easypanel.host/message/sendMedia/Mdk";
const whatsappApiKey = "677BF5E74665-4E65-BA83-EF48D2111BB3";

// Função para gerar comprovante em PDF
async function gerarComprovantePDF({
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
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A5", margin: 30 });
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(18).text("MDK CRÉDITO RÁPIDO", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Contato: ${contato}`);
    doc.text(`Cliente: ${nome}  Tel: ${telefone}`);
    doc.moveDown();
    doc.fontSize(14).text("RECIBO DE PAGAMENTO", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Parcela: ${parcela}`);
    doc.text(`Valor: R$ ${valor.toFixed(2)}`);
    doc.text(`Total Pago: R$ ${totalPago.toFixed(2)}`);
    doc.text(`Forma de Pagamento: ${formaPagamento}`);
    doc.text(`Data Pagamento: ${dataPagamento}`);
    doc.end();
  });
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

    // Gerar PDF do comprovante
    const buffer = await gerarComprovantePDF({
      nome,
      telefone,
      valor,
      parcela,
      totalPago,
      formaPagamento,
      dataPagamento,
      contato,
    });
    // Salvar PDF localmente para debug
    require("fs").writeFileSync("comprovante_teste.pdf", buffer);
    const base64PDF = buffer.toString("base64");

    const payload = {
      number: telefone,
      mediatype: "document",
      mimetype: "application/pdf",
      caption: "Segue o comprovante do seu pagamento em PDF. Obrigado!",
      text: "Segue o comprovante do seu pagamento em PDF. Obrigado!",
      media: base64PDF,
      fileName: "Comprovante.pdf",
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
      .eq("asaas_payment_id", payment.id);

    // Verificar se todas as parcelas do empréstimo estão pagas
    // Buscar a parcela para pegar o id_emprestimo
    const { data: parcelaDb } = await supabase
      .from("parcelas")
      .select("id_emprestimo")
      .eq("asaas_payment_id", payment.id)
      .single();
    const idEmprestimo = parcelaDb?.id_emprestimo;
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
      .json({
        success: true,
        message: "Comprovante em PDF enviado com sucesso!",
      });
  } catch (error) {
    console.error("Erro ao enviar comprovante:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao enviar comprovante" });
  }
});

router.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Webhook está pegando!" });
});

export default router;
