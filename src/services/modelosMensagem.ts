import { supabase } from "./supabase";

export const modelosMensagemService = {
  async getModelo(tipo: string) {
    const { data, error } = await supabase
      .from("modelos_mensagem")
      .select("conteudo")
      .eq("tipo", tipo)
      .single();
    if (error) throw error;
    return data?.conteudo;
  },

  async setModelo(tipo: string, conteudo: string) {
    const { data, error } = await supabase
      .from("modelos_mensagem")
      .upsert(
        { tipo, conteudo, ultima_atualizacao: new Date().toISOString() },
        { onConflict: "tipo" }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
