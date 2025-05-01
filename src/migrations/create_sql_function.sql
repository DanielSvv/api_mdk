-- Criar função para executar SQL dinamicamente
CREATE OR REPLACE FUNCTION executar_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$; 