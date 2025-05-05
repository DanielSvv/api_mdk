import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ASAAS_API_URL = process.env.ASAAS_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

if (!ASAAS_API_URL || !ASAAS_API_KEY) {
  throw new Error(
    "Variáveis de ambiente ASAAS_API_URL e ASAAS_API_KEY são obrigatórias. Configure no .env"
  );
}

interface AsaasClientePayload {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
}

export const asaasService = {
  async criarCliente(dados: AsaasClientePayload) {
    try {
      const response = await axios.post(`${ASAAS_API_URL}/customers`, dados, {
        headers: {
          access_token: ASAAS_API_KEY,
        },
      });
      console.log("Resposta bruta do Asaas:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar cliente no Asaas:", error);
      throw error;
    }
  },

  async criarCobranca({
    customer,
    value,
    dueDate,
  }: {
    customer: string;
    value: number;
    dueDate: string;
  }) {
    try {
      const response = await axios.post(
        `${ASAAS_API_URL}/payments`,
        {
          customer,
          billingType: "PIX",
          value,
          dueDate,
        },
        {
          headers: {
            access_token: ASAAS_API_KEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar cobrança no Asaas:", error);
      throw error;
    }
  },

  async getPixQrCode(paymentId: string) {
    try {
      const response = await axios.get(
        `${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`,
        {
          headers: {
            access_token: ASAAS_API_KEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar QR Code PIX no Asaas:", error);
      throw error;
    }
  },

  async deletarCobranca(paymentId: string) {
    try {
      const response = await axios.delete(
        `${ASAAS_API_URL}/payments/${paymentId}`,
        {
          headers: {
            access_token: ASAAS_API_KEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar cobrança no Asaas:", error);
      throw error;
    }
  },
};
