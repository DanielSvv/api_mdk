import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";
import { asaasService } from "./asaas";
import axios from "axios";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_KEY",
  "WHATSAPP_API_URL",
  "WHATSAPP_API_KEY",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Variável de ambiente ${envVar} não encontrada. Por favor, configure o arquivo .env`
    );
  }
}

// Garante que as variáveis existem após a validação
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const whatsappApiUrl = process.env.WHATSAPP_API_URL!;
const whatsappApiKey = process.env.WHATSAPP_API_KEY!;

console.log("Variáveis de ambiente carregadas com sucesso");

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const mensagemRegras = `Regras Básicas & Avisos Importantes! ⚠️⛔️🧨\n\n1. Jamais deixar de pagar a parcela no dia! Após às 18 hrs acréscimo de R$ 15,00 na parcela.\n\n2. A antecipação de parcelas não interfere no acordo, ou seja, antecipar é opcional da sua parte. \n\n3. Em casos de sinistros, acidentes, doença grave etc… devesse haver penhora de algum item no valor do empréstimo que será devidamente guardado até quitação total do empréstimo! (Ex. Tv, celular, Games)E ainda assim será avaliado caso a caso!\n\n4. Só será liberado um segundo empréstimo após quitação do atual.\n\n5. Não solicitem empréstimos que não tem capacidade de pagamento, selecionem o valor coincidente com seu faturamento diário. \n\n6. Pagamento diária em até 20 dias de segunda a sábado.\n\n7. Feriados contam como dia normal de pagamento!\n\n- ⚠️ Aos honestos, essa parte não importa más leiam!\n\nA) Utilizamos serviço de rastreio de placas em tempo real, sabemos onde o seu veículo está passando com muita facilidade se for necessário!\n\nB) Não, em hipótese nenhuma já ficamos no prejuízo, precise utilizar a força que for necessária será utilizada! Exemplo do último engraçadinho teve o veículo totalmente deteriorado além de transtorno na porta de casa! \n\nC) Evitem não cumprir com a palavra para que não hajam problemas graves. \n\nNo mais, somos uma empresa voltada para sanar emergências de motoristas de aplicativos, dinheiro rápido e recorrente para trabalhadores honestos que precisam pagar uma parcela atrasada, um IPVA, fazer uma manutenção, pagar um aluguel etc…\n\nEstá de acordo com todas as regras? Sim ou Cancelamos?`;

// Funções para Clientes
export const clienteService = {
  async listarClientes() {
    const { data, error } = await supabase.from("clientes").select("*");

    if (error) throw error;
    return data;
  },

  async buscarClientePorId(id: number) {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id_cliente", id.toString())
      .single();

    if (error) throw error;
    return data;
  },

  async buscarClientePorAsaasId(asaasId: string) {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("asaas_id", asaasId.toString())
      .single();
    return { data, error };
  },

  async buscarClientePorCpf(cpf: string) {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("cpf", cpf)
      .single();

    if (error) throw error;
    return data;
  },

  async criarCliente(
    cliente: Omit<
      Database["public"]["Tables"]["clientes"]["Insert"],
      "id_cliente" | "data_criacao"
    >
  ) {
    try {
      // Criar cliente no Asaas
      let asaasResponse;
      try {
        asaasResponse = await asaasService.criarCliente({
          name: cliente.nome || "",
          cpfCnpj: cliente.cpf || "",
          email: cliente.email || "",
          address: cliente.endereco || "",
          mobilePhone: cliente.contato_familiar || "",
          postalCode: "00000000",
          externalReference: Date.now().toString(),
        });
      } catch (error: any) {
        // Tratamento de erro de duplicidade do Asaas
        const asaasError = error?.response?.data;
        if (
          asaasError?.errors?.some(
            (e: any) =>
              e.code === "client_already_exists" ||
              e.description?.toLowerCase().includes("já existe") ||
              e.description?.toLowerCase().includes("existente")
          )
        ) {
          throw new Error("Cliente duplicado");
        }
        throw error;
      }

      // Criar cliente no Supabase com o ID do Asaas
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          ...cliente,
          asaas_id: asaasResponse.id,
          status_cliente: "ativo",
          data_criacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (
          error.code === "23505" ||
          error.message?.toLowerCase().includes("duplicate") ||
          error.message?.toLowerCase().includes("duplicado")
        ) {
          throw new Error("Cliente duplicado");
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  },

  async atualizarCliente(
    id: number,
    cliente: Database["public"]["Tables"]["clientes"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("clientes")
      .update(cliente)
      .eq("id_cliente", id.toString())
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletarCliente(id: number) {
    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id_cliente", id.toString());
    if (error) throw error;
    return true;
  },
};

// Funções para Empréstimos
export const emprestimoService = {
  async listarEmprestimos() {
    const { data, error } = await supabase.from("emprestimos").select("*");

    if (error) throw error;
    return data;
  },

  async buscarEmprestimoPorId(id: number) {
    const { data, error } = await supabase
      .from("emprestimos")
      .select("*")
      .eq("id_emprestimo", id)
      .single();

    if (error) throw error;
    return data;
  },

  async criarEmprestimo(
    dados: Omit<
      Database["public"]["Tables"]["emprestimos"]["Insert"],
      "id_emprestimo" | "data_criacao"
    > & { quantidade_parcelas: number; notification_fds?: boolean }
  ) {
    // Extrai os campos necessários
    const {
      quantidade_parcelas,
      valor_emprestimo,
      id_cliente,
      notification_fds = false,
      ...emprestimo
    } = dados;
    if (!quantidade_parcelas || !valor_emprestimo || !id_cliente) {
      throw new Error(
        "Quantidade de parcelas, valor do empréstimo e id_cliente são obrigatórios"
      );
    }
    // Busca o cliente para pegar o asaas_id e telefone
    const { data: cliente, error: errorCliente } = await supabase
      .from("clientes")
      .select("asaas_id, telefone")
      .eq("id_cliente", id_cliente)
      .single();
    if (errorCliente || !cliente?.asaas_id || !cliente?.telefone) {
      throw new Error("Cliente não encontrado, sem asaas_id ou sem telefone");
    }
    // Cria o empréstimo
    const { data: emprestimoCriado, error } = await supabase
      .from("emprestimos")
      .insert({
        ...emprestimo,
        id_cliente,
        valor_emprestimo,
        data_criacao: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    // Cria as parcelas e as cobranças no Asaas
    const valorParcelaFloat = valor_emprestimo / quantidade_parcelas;
    const valorParcelaBase = Math.floor(valorParcelaFloat); // Arredonda para baixo para garantir número inteiro
    const diferenca =
      valor_emprestimo - valorParcelaBase * (quantidade_parcelas - 1); // Última parcela terá o valor restante
    const parcelasCriadas = [];
    let dataVencimento = new Date();
    let parcelasAgendadas = 0;
    while (parcelasAgendadas < quantidade_parcelas) {
      // Avança para o próximo dia permitido
      dataVencimento.setDate(dataVencimento.getDate() + 1);
      const diaSemana = dataVencimento.getDay(); // 0 = domingo, 6 = sábado
      if (
        (!notification_fds && (diaSemana === 0 || diaSemana === 6)) || // Pular sábados e domingos se notification_fds = false
        (notification_fds && diaSemana === 0) // Pular só domingos se notification_fds = true
      ) {
        continue;
      }
      const valorParcela =
        parcelasAgendadas === quantidade_parcelas - 1
          ? diferenca
          : valorParcelaBase;
      const parcela = {
        id_emprestimo: emprestimoCriado.id_emprestimo,
        numero_parcela: parcelasAgendadas + 1,
        valor_parcela: valorParcela,
        data_vencimento: dataVencimento.toISOString().split("T")[0],
        status_pagamento: "agendada",
        data_criacao: new Date().toISOString(),
        notification_fds,
      };
      const { data: parcelaCriada, error: errorParcela } = await supabase
        .from("parcelas")
        .insert(parcela)
        .select()
        .single();
      if (errorParcela) throw errorParcela;
      parcelasCriadas.push(parcelaCriada);
      parcelasAgendadas++;
    }
    // Envia mensagem de regras para o cliente
    try {
      await axios.post(
        whatsappApiUrl,
        {
          number: cliente.telefone,
          text: mensagemRegras,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: whatsappApiKey,
          },
        }
      );
    } catch (err) {
      console.error(
        "Erro ao enviar mensagem de regras WhatsApp:",
        (err as any).response?.data || (err as Error).message
      );
    }
    return { ...emprestimoCriado, parcelas: parcelasCriadas };
  },

  async cancelarEmprestimo(id_emprestimo: number) {
    const { error: errorEmprestimo } = await supabase
      .from("emprestimos")
      .update({ status_emprestimo: "cancelado" })
      .eq("id_emprestimo", id_emprestimo.toString());

    if (errorEmprestimo) throw errorEmprestimo;

    const { error: errorParcelas } = await supabase
      .from("parcelas")
      .update({ status_pagamento: "cancelada" })
      .eq("id_emprestimo", id_emprestimo.toString())
      .eq("status_pagamento", "agendada");

    if (errorParcelas) throw errorParcelas;
    return true;
  },
};

// Funções para Parcelas
export const parcelaService = {
  async listarParcelas() {
    const { data, error } = await supabase.from("parcelas").select("*");

    if (error) throw error;
    return data;
  },

  async buscarParcelaPorId(id: number) {
    const { data, error } = await supabase
      .from("parcelas")
      .select("*")
      .eq("id_parcela", id)
      .single();

    if (error) throw error;
    return data;
  },

  async criarParcela(
    parcela: Omit<
      Database["public"]["Tables"]["parcelas"]["Insert"],
      "id_parcela" | "data_criacao"
    >
  ) {
    const { data, error } = await supabase
      .from("parcelas")
      .insert(parcela)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizarParcela(
    id: number,
    parcela: Database["public"]["Tables"]["parcelas"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("parcelas")
      .update(parcela)
      .eq("id_parcela", id.toString())
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
