import cron from "node-cron";
import { asaasService } from "../services/asaas";
import { supabase } from "../services/supabase";
import axios from "axios";
// @ts-ignore

const whatsappApiUrl =
  "https://evolutionapi-evolution-api.pqfhfk.easypanel.host/message/sendText/Mdk";
const whatsappApiKey = "677BF5E74665-4E65-BA83-EF48D2111BB3";

// Novo cron job diário às 08h00
cron.schedule(
  "0 8 * * *",
  async () => {
    const hoje = new Date().toISOString().split("T")[0];
    const diaSemana = new Date().getDay(); // 0 = domingo, 6 = sábado
    const { data: parcelas, error } = await supabase
      .from("parcelas")
      .select("*")
      .eq("data_vencimento", hoje)
      .eq("status_pagamento", "agendada");
    if (error) {
      console.error("Erro ao buscar parcelas do dia:", error);
      return;
    }
    for (const parcela of parcelas || []) {
      // Se for sábado ou domingo, só envia se notification_fds for true
      if ((diaSemana === 0 || diaSemana === 6) && !parcela.notification_fds)
        continue;
      // Se não for sábado/domingo, envia normalmente
      try {
        // Buscar o empréstimo para pegar o id_cliente
        const { data: emprestimo } = await supabase
          .from("emprestimos")
          .select("id_cliente")
          .eq("id_emprestimo", parcela.id_emprestimo)
          .single();
        if (!emprestimo) continue;
        // Buscar o cliente para pegar o telefone e nome
        const { data: clienteDb } = await supabase
          .from("clientes")
          .select("telefone, nome, asaas_id")
          .eq("id_cliente", emprestimo.id_cliente)
          .single();
        if (!clienteDb || !clienteDb.telefone || !clienteDb.asaas_id) continue;
        // Cria cobrança no Asaas
        const cobranca = await asaasService.criarCobranca({
          customer: clienteDb.asaas_id,
          value: parcela.valor_parcela,
          dueDate: parcela.data_vencimento,
        });
        // Busca o payload do QR Code PIX
        const qrCode = await asaasService.getPixQrCode(cobranca.id);
        const pixPayload = qrCode?.payload || null;
        // Monta mensagens
        const mensagemInfo = `*MDK SOLUÇÕES*\nSua Parcela Vence Hoje!\nParcela: ${parcela.numero_parcela}\nValor: R$ ${parcela.valor_parcela}\nVencimento: ${parcela.data_vencimento} às 18h00.`;
        const mensagemPix = `${pixPayload}`;
        const mensagemInstrucao = `Pague copiando e colando o código acima 👆🏻`;

        // Envia as três mensagens em sequência
        try {
          // Primeira mensagem - Informações
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemInfo,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          // Segunda mensagem - Código PIX
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemPix,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          // Terceira mensagem - Instrução
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemInstrucao,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          console.log("Mensagens enviadas com sucesso!");
        } catch (err) {
          console.error(
            "Erro ao enviar mensagens WhatsApp:",
            (err as any).response?.data || (err as Error).message
          );
        }
        // Atualiza a parcela no banco
        await supabase
          .from("parcelas")
          .update({
            asaas_payment_id: cobranca.id,
            pix_payload: pixPayload,
            status_pagamento: "enviado",
          })
          .eq("id_parcela", parcela.id_parcela);
      } catch (e) {
        console.error("Erro ao processar parcela:", (e as Error).message);
      }
    }
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

// Novo cron job diário às 13h05 para lembrete de pagamento
cron.schedule(
  "9 13 * * *",
  async () => {
    const hoje = new Date().toISOString().split("T")[0];
    const diaSemana = new Date().getDay();
    const { data: parcelas, error } = await supabase
      .from("parcelas")
      .select("*")
      .eq("data_vencimento", hoje)
      .eq("status_pagamento", "enviado");
    if (error) {
      console.error("Erro ao buscar parcelas do dia:", error);
      return;
    }
    for (const parcela of parcelas || []) {
      if ((diaSemana === 0 || diaSemana === 6) && !parcela.notification_fds)
        continue;
      try {
        // Buscar o empréstimo para pegar o id_cliente
        const { data: emprestimo } = await supabase
          .from("emprestimos")
          .select("id_cliente")
          .eq("id_emprestimo", parcela.id_emprestimo)
          .single();
        if (!emprestimo) continue;
        // Buscar o cliente para pegar o telefone e nome
        const { data: clienteDb } = await supabase
          .from("clientes")
          .select("telefone, nome, asaas_id")
          .eq("id_cliente", emprestimo.id_cliente)
          .single();
        if (!clienteDb || !clienteDb.telefone || !clienteDb.asaas_id) continue;
        // Cria cobrança no Asaas
        const cobranca = await asaasService.criarCobranca({
          customer: clienteDb.asaas_id,
          value: parcela.valor_parcela,
          dueDate: parcela.data_vencimento,
        });
        // Busca o payload do QR Code PIX
        const qrCode = await asaasService.getPixQrCode(cobranca.id);
        const pixPayload = qrCode?.payload || null;
        // Monta mensagens
        const mensagemInfo = `*MDK SOLUÇÕES*\nSua Parcela Vence Hoje!\nParcela: ${parcela.numero_parcela}\nValor: R$ ${parcela.valor_parcela}\nVencimento: ${parcela.data_vencimento} às 18h00.`;
        const mensagemPix = `${pixPayload}`;
        const mensagemInstrucao = `Pague copiando e colando o código acima 👆🏻`;

        // Envia as três mensagens em sequência
        try {
          // Primeira mensagem - Informações
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemInfo,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          // Segunda mensagem - Código PIX
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemPix,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          // Terceira mensagem - Instrução
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemInstrucao,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          console.log("Mensagens de lembrete enviadas com sucesso!");
        } catch (err) {
          console.error(
            "Erro ao enviar mensagens de lembrete WhatsApp:",
            (err as any).response?.data || (err as Error).message
          );
        }
        // Não atualiza status_pagamento, pois é só lembrete
      } catch (e) {
        console.error(
          "Erro ao processar lembrete de parcela:",
          (e as Error).message
        );
      }
    }
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

// Novo cron job diário às 18h00 para cobrança com juros
cron.schedule(
  "0 18 * * *",
  async () => {
    const hoje = new Date().toISOString().split("T")[0];
    const diaSemana = new Date().getDay();
    const { data: parcelas, error } = await supabase
      .from("parcelas")
      .select("*")
      .eq("data_vencimento", hoje)
      .eq("status_pagamento", "enviado");
    if (error) {
      console.error("Erro ao buscar parcelas enviadas do dia:", error);
      return;
    }
    for (const parcela of parcelas || []) {
      if ((diaSemana === 0 || diaSemana === 6) && !parcela.notification_fds)
        continue;
      try {
        // Cancelar a cobrança no Asaas
        if (parcela.asaas_payment_id) {
          try {
            await asaasService.deletarCobranca(parcela.asaas_payment_id);
          } catch (err) {
            console.error("Erro ao cancelar cobrança no Asaas:", err);
          }
        }
        // Atualizar status da parcela para 'cancelada'
        await supabase
          .from("parcelas")
          .update({ status_pagamento: "cancelada" })
          .eq("id_parcela", parcela.id_parcela);
        // Buscar o empréstimo para pegar o id_cliente
        const { data: emprestimo } = await supabase
          .from("emprestimos")
          .select("id_cliente")
          .eq("id_emprestimo", parcela.id_emprestimo)
          .single();
        if (!emprestimo) continue;
        // Buscar o cliente para pegar o telefone, nome e asaas_id
        const { data: clienteDb } = await supabase
          .from("clientes")
          .select("telefone, nome, asaas_id")
          .eq("id_cliente", emprestimo.id_cliente)
          .single();
        if (!clienteDb || !clienteDb.telefone || !clienteDb.asaas_id) continue;
        // Criar nova parcela com acréscimo de R$ 15
        const novoValor = Number(parcela.valor_parcela) + 15;
        const { data: novaParcela, error: erroNovaParcela } = await supabase
          .from("parcelas")
          .insert({
            id_emprestimo: parcela.id_emprestimo,
            numero_parcela: parcela.numero_parcela, // mantém o mesmo número
            valor_parcela: novoValor,
            data_vencimento: hoje,
            status_pagamento: "agendada",
            data_criacao: new Date().toISOString(),
          })
          .select()
          .single();
        if (erroNovaParcela) {
          console.error(
            "Erro ao criar nova parcela com juros:",
            erroNovaParcela
          );
          continue;
        }
        // Criar nova cobrança no Asaas
        const cobranca = await asaasService.criarCobranca({
          customer: clienteDb.asaas_id,
          value: novoValor,
          dueDate: hoje,
        });
        // Buscar o payload do QR Code PIX
        const qrCode = await asaasService.getPixQrCode(cobranca.id);
        const pixPayload = qrCode?.payload || null;
        // Atualizar a nova parcela com o asaas_payment_id e pix_payload
        await supabase
          .from("parcelas")
          .update({
            asaas_payment_id: cobranca.id,
            pix_payload: pixPayload,
            status_pagamento: "enviado",
          })
          .eq("id_parcela", novaParcela.id_parcela);
        // Monta mensagens de cobrança com juros
        const mensagemInfo = `*MDK SOLUÇÕES*\nSua Parcela Anterior Venceu!\n⚠️ Nova Cobrança com Juros Adicionais ⚠️\nParcela: ${parcela.numero_parcela}\nValor Original: R$ ${parcela.valor_parcela}\nValor com Juros: R$ ${novoValor}\nVencimento: ${hoje} às 18h00.`;
        const mensagemPix = `${pixPayload}`;
        const mensagemInstrucao = `Pague copiando e colando o código acima 👆🏻`;

        // Envia as três mensagens em sequência
        try {
          // Primeira mensagem - Informações
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemInfo,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          // Segunda mensagem - Código PIX
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemPix,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          // Terceira mensagem - Instrução
          await axios.post(
            whatsappApiUrl,
            {
              number: clienteDb.telefone,
              text: mensagemInstrucao,
            },
            {
              headers: {
                "Content-Type": "application/json",
                apikey: whatsappApiKey,
              },
            }
          );

          console.log("Mensagem de cobrança com juros enviada com sucesso!");
        } catch (err) {
          console.error(
            "Erro ao enviar mensagem de cobrança com juros WhatsApp:",
            (err as any).response?.data || (err as Error).message
          );
        }
      } catch (e) {
        console.error(
          "Erro ao processar cobrança com juros:",
          (e as Error).message
        );
      }
    }
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

// Cron job para relatório de parcelas canceladas às 18h10
cron.schedule(
  "10 18 * * *",
  async () => {
    console.log(
      "Iniciando envio de relatório de parcelas canceladas do dia:",
      new Date().toISOString().split("T")[0]
    );

    const hoje = new Date().toISOString().split("T")[0];

    // Busca todas as parcelas canceladas do dia
    const { data: parcelasCanceladas, error } = await supabase
      .from("parcelas")
      .select(
        `
        *,
        emprestimos:id_emprestimo (
          clientes:id_cliente (
            nome,
            telefone
          )
        )
      `
      )
      .eq("data_vencimento", hoje)
      .eq("status_pagamento", "cancelada");

    if (error) {
      console.error("Erro ao buscar parcelas canceladas:", error);
      return;
    }

    if (!parcelasCanceladas || parcelasCanceladas.length === 0) {
      console.log("Nenhuma parcela cancelada hoje.");
      return;
    }

    // Monta o relatório
    let mensagem = `*MDK SOLUÇÕES - RELATÓRIO DE INADIMPLENTES*\nData: ${hoje}\n\n`;
    mensagem += `Total de parcelas canceladas hoje: ${parcelasCanceladas.length}\n\n`;
    mensagem += "Lista de clientes:\n";

    parcelasCanceladas.forEach((parcela, index) => {
      mensagem += `\n${index + 1}. Cliente: ${
        parcela.emprestimos.clientes.nome
      }\n`;
      mensagem += `   Parcela: ${parcela.numero_parcela}\n`;
      mensagem += `   Valor: R$ ${parcela.valor_parcela}\n`;
      mensagem += `   Telefone: ${parcela.emprestimos.clientes.telefone}\n`;
      mensagem += "   ----------------------";
    });

    // Envia o relatório
    try {
      await axios.post(
        whatsappApiUrl,
        {
          number: "5561920033978", // Número fixo para receber o relatório
          text: mensagem,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: whatsappApiKey,
          },
        }
      );
      console.log("Relatório de parcelas canceladas enviado com sucesso!");
    } catch (err) {
      console.error(
        "Erro ao enviar relatório de parcelas canceladas:",
        (err as any).response?.data || (err as Error).message
      );
    }
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

// Não exporta mais agendarJobParcela, pois não é mais necessário
