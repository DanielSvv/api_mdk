import express from "express";
import { supabase } from "../services/supabase";
import { asaasService } from "../services/asaas";
import axios from "axios";

const router = express.Router();

const whatsappApiUrl =
  "https://evolutionapi-evolution-api.pqfhfk.easypanel.host/message/sendText/Mdk";
const whatsappApiKey = "677BF5E74665-4E65-BA83-EF48D2111BB3";

// Middleware para verificar o token
const verificarToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers["access_token"] as string;
  const ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcsInRpcG8iOiJjbGllbnRlIiwiaWF0IjoxNzQ2MzcwNDkwLCJleHAiOjE3NDY0NTY4OTB9.CySeP-4Q6KuFPDWyLCmF-JSoFtBRtH7gIbY9tH0nvGo";

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  if (token !== ACCESS_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
};

router.use(verificarToken);

// Rota para antecipar parcelas ou quitar empréstimo
router.post("/", async (req, res) => {
  try {
    const { id_emprestimo, numero_parcelas } = req.body;

    if (!id_emprestimo) {
      return res.status(400).json({ error: "ID do empréstimo é obrigatório" });
    }

    // Buscar parcelas não pagas do empréstimo
    const { data: parcelas, error: parcelasError } = await supabase
      .from("parcelas")
      .select("*")
      .eq("id_emprestimo", id_emprestimo)
      .in("status_pagamento", ["agendada", "enviado"])
      .order("numero_parcela", { ascending: true });

    if (parcelasError || !parcelas) {
      return res.status(400).json({ error: "Erro ao buscar parcelas" });
    }

    if (parcelas.length === 0) {
      return res
        .status(400)
        .json({ error: "Não há parcelas disponíveis para antecipação" });
    }

    // Se número de parcelas não for especificado, considera quitação total
    const parcelasParaAntecipar = numero_parcelas
      ? parcelas.slice(0, numero_parcelas)
      : parcelas;

    // Calcular valor total
    const valorTotal = parcelasParaAntecipar.reduce(
      (total, parcela) => total + Number(parcela.valor_parcela),
      0
    );

    // Buscar dados do cliente
    const { data: emprestimo } = await supabase
      .from("emprestimos")
      .select("id_cliente")
      .eq("id_emprestimo", id_emprestimo)
      .single();

    if (!emprestimo) {
      return res.status(400).json({ error: "Empréstimo não encontrado" });
    }

    const { data: cliente } = await supabase
      .from("clientes")
      .select("*")
      .eq("id_cliente", emprestimo.id_cliente)
      .single();

    if (!cliente || !cliente.asaas_id) {
      return res.status(400).json({ error: "Cliente não encontrado" });
    }

    // Criar nova cobrança no Asaas
    const cobranca = await asaasService.criarCobranca({
      customer: cliente.asaas_id,
      value: valorTotal,
      dueDate: new Date().toISOString().split("T")[0], // Vencimento hoje
    });

    // Buscar QR Code PIX
    const qrCode = await asaasService.getPixQrCode(cobranca.id);
    const pixPayload = qrCode?.payload || null;

    // Cancelar parcelas antigas no Asaas
    for (const parcela of parcelasParaAntecipar) {
      if (parcela.asaas_payment_id) {
        try {
          await asaasService.deletarCobranca(parcela.asaas_payment_id);
        } catch (error) {
          console.error("Erro ao cancelar cobrança:", error);
        }
      }
    }

    // Atualizar status das parcelas para antecipadas
    const parcelasIds = parcelasParaAntecipar.map((p) => p.id_parcela);
    await supabase
      .from("parcelas")
      .update({ status_pagamento: "antecipada" })
      .in("id_parcela", parcelasIds);

    // Criar nova parcela única com valor total
    const { data: novaParcela, error: novaParcelaError } = await supabase
      .from("parcelas")
      .insert({
        id_emprestimo,
        numero_parcela: 1,
        valor_parcela: valorTotal,
        data_vencimento: new Date().toISOString().split("T")[0],
        status_pagamento: "enviado",
        asaas_payment_id: cobranca.id,
        pix_payload: pixPayload,
        data_criacao: new Date().toISOString(),
      })
      .select()
      .single();

    if (novaParcelaError) {
      return res.status(500).json({ error: "Erro ao criar nova parcela" });
    }

    // Enviar mensagens WhatsApp
    const mensagemInfo = `*MDK SOLUÇÕES*\n${
      numero_parcelas ? "Antecipação de Parcelas" : "Quitação de Empréstimo"
    }\nValor Total: R$ ${valorTotal}\nVencimento: Hoje às 18h00.`;
    const mensagemPix = `${pixPayload}`;
    const mensagemInstrucao = `Pague copiando e colando o código acima 👆🏻`;

    // Enviar as três mensagens
    await axios.post(
      whatsappApiUrl,
      { number: cliente.telefone, text: mensagemInfo },
      {
        headers: { "Content-Type": "application/json", apikey: whatsappApiKey },
      }
    );

    await axios.post(
      whatsappApiUrl,
      { number: cliente.telefone, text: mensagemPix },
      {
        headers: { "Content-Type": "application/json", apikey: whatsappApiKey },
      }
    );

    await axios.post(
      whatsappApiUrl,
      { number: cliente.telefone, text: mensagemInstrucao },
      {
        headers: { "Content-Type": "application/json", apikey: whatsappApiKey },
      }
    );

    res.json({
      success: true,
      message: numero_parcelas
        ? "Parcelas antecipadas com sucesso"
        : "Empréstimo quitado com sucesso",
      valor_total: valorTotal,
      parcelas_antecipadas: parcelasParaAntecipar.length,
      nova_parcela: novaParcela,
    });
  } catch (error) {
    console.error("Erro na antecipação:", error);
    res.status(500).json({ error: "Erro ao processar antecipação" });
  }
});

export default router;
