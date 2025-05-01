import axios from "axios";

const ASAAS_API_URL = "https://api.asaas.com/v3";
const ASAAS_API_KEY =
  process.env.ASAAS_API_KEY ||
  "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmRjZGRlOGJhLTAyMTktNDc1Yi1hNzdiLTFiMDA0Y2VmNjUyNDo6JGFhY2hfZjE1Y2Q0ZDctNTJkYi00MTNiLTllMjEtZGEyNjM0Nzg0ZTdm";

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
