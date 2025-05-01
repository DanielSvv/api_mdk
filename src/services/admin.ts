import { supabase } from "./supabase";
import bcrypt from "bcrypt";

export const adminService = {
  async verificarEstrutura() {
    try {
      // Verificar se a tabela existe
      const { data, error } = await supabase
        .from("administradores")
        .select("id_admin")
        .limit(1);

      if (error) {
        console.error("Erro ao verificar tabela:", error);
        // Se a tabela não existe, vamos criar usando RPC
        const { error: createError } = await supabase.rpc(
          "criar_tabela_administradores"
        );

        if (createError) {
          throw createError;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao verificar/criar estrutura:", error);
      throw error;
    }
  },

  async listarAdministradores() {
    const { data, error } = await supabase
      .from("administradores")
      .select("id_admin, nome, email, data_criacao");

    if (error) throw error;
    return data;
  },

  async buscarAdminPorId(id: number) {
    const { data, error } = await supabase
      .from("administradores")
      .select("id_admin, nome, email, data_criacao")
      .eq("id_admin", id)
      .single();

    if (error) throw error;
    return data;
  },

  async criarAdmin(admin: { nome: string; email: string; senha: string }) {
    const senhaHash = await bcrypt.hash(admin.senha, 10);

    const { data, error } = await supabase
      .from("administradores")
      .insert({
        nome: admin.nome,
        email: admin.email.toLowerCase(),
        senha: senhaHash,
      })
      .select("id_admin, nome, email, data_criacao")
      .single();

    if (error) {
      if (error.message.includes("unique constraint")) {
        throw new Error("Email já cadastrado");
      }
      throw error;
    }

    return data;
  },

  async atualizarAdmin(id: number, dados: { nome?: string; email?: string }) {
    const { data, error } = await supabase
      .from("administradores")
      .update({
        ...dados,
        email: dados.email?.toLowerCase(),
      })
      .eq("id_admin", id)
      .select("id_admin, nome, email, data_criacao")
      .single();

    if (error) {
      if (error.message.includes("unique constraint")) {
        throw new Error("Email já cadastrado");
      }
      throw error;
    }

    return data;
  },

  async alterarSenhaAdmin(id: number, senhaAtual: string, novaSenha: string) {
    // Buscar admin com senha
    const { data: admin, error: errorBusca } = await supabase
      .from("administradores")
      .select("*")
      .eq("id_admin", id)
      .single();

    if (errorBusca || !admin) {
      throw new Error("Administrador não encontrado");
    }

    // Verificar senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, admin.senha);
    if (!senhaCorreta) {
      throw new Error("Senha atual incorreta");
    }

    // Atualizar senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    const { error: errorUpdate } = await supabase
      .from("administradores")
      .update({ senha: senhaHash })
      .eq("id_admin", id);

    if (errorUpdate) throw errorUpdate;
    return true;
  },

  async excluirAdmin(id: number) {
    // Verificar se não é o último administrador
    const { count } = await supabase
      .from("administradores")
      .select("*", { count: "exact" });

    if (count === 1) {
      throw new Error("Não é possível excluir o último administrador");
    }

    const { error } = await supabase
      .from("administradores")
      .delete()
      .eq("id_admin", id);

    if (error) throw error;
    return true;
  },
};
