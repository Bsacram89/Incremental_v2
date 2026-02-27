
# === FATURAMENTO GERAL - ADAPTADO PARA MICROSOFT FABRIC ===
print("PROCESSANDO FATURAMENTO GERAL - VERSÃO PARA FABRIC")

import pandas as pd
import os
import warnings
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, regexp_extract, to_date
from pyspark.sql.types import StructType, StructField, StringType, LongType, DoubleType, DateType
import re
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

# No Microsoft Fabric, a SparkSession já é fornecida como 'spark'
# Não é necessário criar uma nova SparkSession aqui.
# spark = SparkSession.builder ... .getOrCreate()

# Caminho da pasta no Fabric. Assumindo que os arquivos estão no Lakehouse.
# O usuário mencionou '/lakehouse/default/Files/Jaguaré/PIRA/'
caminho_pasta = "/lakehouse/default/Files/Jaguaré/PIRA/"

def limpar_nome_coluna_spark(nome):
    if nome is None:
        return "Coluna_Vazia"
    nome_str = str(nome).strip()
    # Substitui caracteres especiais por '_' e remove múltiplos underscores
    nome_limpo = re.sub(r"[^a-zA-Z0-9_]", "_", nome_str)
    nome_limpo = re.sub(r"__+", "_", nome_limpo).strip("_")
    # Adiciona um prefixo se o nome começar com um número
    if re.match(r"^\d", nome_limpo):
        nome_limpo = "Col_" + nome_limpo
    return nome_limpo if nome_limpo else "Coluna_Sem_Nome"

def garantir_colunas_unicas(colunas):
    """Garante que não há colunas duplicadas, adicionando sufixos numéricos."""
    colunas_unicas = []
    contagem = {}
    for col in colunas:
        original_col = col
        if original_col in contagem:
            contagem[original_col] += 1
            colunas_unicas.append(f"{original_col}_{contagem[original_col]}")
        else:
            contagem[original_col] = 0
            colunas_unicas.append(original_col)
    return colunas_unicas

def processar_faturamento_geral():
    try:
        arquivos_excel = []
        # Para listar arquivos em um sistema de arquivos distribuído como o Fabric,
        # é melhor usar a API do Spark ou funções específicas do Fabric se disponíveis.
        # Para simplificar, vamos assumir que 'os.listdir' pode funcionar se o caminho for montado localmente
        # ou se estivermos em um ambiente que abstrai isso (como o Fabric para caminhos do Lakehouse).
        
        # No Fabric, você pode usar mssparkutils.fs.ls(caminho_pasta) para listar arquivos.
        # No entanto, para pd.read_excel, os arquivos precisam ser acessíveis localmente ou via um sistema de montagem.
        # Para este exemplo, vamos manter os.listdir e assumir que o Fabric lida com isso para caminhos do Lakehouse.
        
        if not os.path.exists(caminho_pasta):
            print(f"Erro: O caminho da pasta não existe: {caminho_pasta}. Verifique se o Lakehouse está montado corretamente.")
            return None

        files = os.listdir(caminho_pasta)
        
        for arquivo in files:
            if arquivo.endswith((".xlsx", ".xls")) and not arquivo.startswith("~"):
                caminho_completo = os.path.join(caminho_pasta, arquivo)
                arquivos_excel.append((caminho_completo, arquivo))
        
        print(f"Processando {len(arquivos_excel)} arquivos Excel")
        dfs_todos = []
        
        for caminho_arquivo, nome_arquivo in arquivos_excel:
            try:
                xl_file = pd.ExcelFile(caminho_arquivo)
                if "E6_Fat Cliente" not in xl_file.sheet_names:
                    print(f"  Aba \'E6_Fat Cliente\' não encontrada em {nome_arquivo}")
                    continue
                
                # Ler o arquivo sem cabeçalho para ter acesso aos valores como dados
                df_raw = pd.read_excel(caminho_arquivo, sheet_name="E6_Fat Cliente", header=None, engine="openpyxl")
                
                if df_raw.empty:
                    print(f"  DataFrame vazio após leitura de {nome_arquivo}")
                    continue

                # Remover colunas desnecessárias (Column25 a Column32)
                # O range é 0-based, então Column25 é índice 24
                cols_to_drop_indices = [i for i in range(24, min(32, len(df_raw.columns)))]
                df_raw = df_raw.drop(columns=cols_to_drop_indices, errors="ignore")
                
                # Filtrar linhas onde a coluna 3 (índice 2) não é nula
                if 2 in df_raw.columns:
                    df_raw = df_raw[df_raw[2].notna()].reset_index(drop=True)
                else:
                    print(f"  Coluna de filtro (índice 2) não encontrada em {nome_arquivo}")
                    continue
                
                if df_raw.empty:
                    print(f"  Nenhum dado após filtros em {nome_arquivo}")
                    continue
                
                # Transpor a tabela
                df_transposed_raw = df_raw.T
                
                # Filtros específicos na primeira coluna do DataFrame transposto (que era a primeira linha do original)
                filter_values = [
                    None, 
                    0.010799999999999999, 
                    0.012, 
                    24813.207960687996, 
                    "CMV JAGUARE", 
                    "CSLL", 
                    "IMPOSTOS", 
                    "IRPJ"
                ]
                
                # Garante que a coluna 0 existe antes de tentar filtrar
                if 0 in df_transposed_raw.columns:
                    mask = ~df_transposed_raw[0].isin(filter_values)
                    df_filtrado = df_transposed_raw[mask].reset_index(drop=True)
                else:
                    print(f"  Coluna de filtro (índice 0 transposto) não encontrada em {nome_arquivo}")
                    continue

                if df_filtrado.empty:
                    print(f"  DataFrame vazio após filtro de valores em {nome_arquivo}")
                    continue
                    
                # Transpõe novamente
                df_final = df_filtrado.T
                
                if df_final.empty:
                    print(f"  DataFrame vazio após transposição final em {nome_arquivo}")
                    continue

                # Promover cabeçalhos (a primeira linha se torna o cabeçalho)
                colunas_originais = df_final.iloc[0].values
                colunas_limpas = [limpar_nome_coluna_spark(col) for col in colunas_originais]
                colunas_unicas = garantir_colunas_unicas(colunas_limpas)
                
                df_dados = df_final.iloc[1:].copy()
                df_dados.columns = colunas_unicas
                
                # Extrai data do nome do arquivo (ajustado para o formato esperado)
                match = re.search(r"PIRAJaguaré_(\d{2})\.(\d{4})", nome_arquivo)
                
                if match:
                    mes, ano = match.groups()
                    data_arquivo = pd.to_datetime(f"{ano}-{mes}-01")
                    df_dados["MESES"] = data_arquivo
                else:
                    print(f"  Não foi possível extrair a data do nome do arquivo: {nome_arquivo}")
                    df_dados["MESES"] = None # Ou um valor padrão
                
                df_dados["Arquivo"] = nome_arquivo
                
                # RESET INDEX para evitar problemas no concat
                df_dados = df_dados.reset_index(drop=True)
                
                dfs_todos.append(df_dados)
                print(f"  Processado: {nome_arquivo} - {len(df_dados)} registros")
                print(f"    Colunas: {len(df_dados.columns)} ({list(df_dados.columns)[:5]}...)")
                        
            except Exception as e:
                print(f"  Erro em {nome_arquivo}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        if dfs_todos:
            print(f"\nConsolidando {len(dfs_todos)} DataFrames...")
            
            # Encontra todas as colunas únicas entre todos os DataFrames
            todas_colunas_globais = set()
            for df in dfs_todos:
                todas_colunas_globais.update(df.columns)
            todas_colunas_globais = sorted(list(todas_colunas_globais))
            
            # Reindexa todos os DataFrames com as mesmas colunas antes de concatenar
            dfs_alinhados = []
            for df in dfs_todos:
                df_alinhado = df.reindex(columns=todas_colunas_globais)
                dfs_alinhados.append(df_alinhado)
            
            try:
                df_consolidado = pd.concat(dfs_alinhados, ignore_index=True, sort=False)
                print(f"✅ Consolidação bem-sucedida: {len(df_consolidado)} registros")
                return df_consolidado
            except Exception as e:
                print(f"Erro no concat após alinhamento: {str(e)}")
                import traceback
                traceback.print_exc()
                return None
        
        return None
        
    except Exception as e:
        print(f"Erro geral: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# Executa processamento
df_faturamento = processar_faturamento_geral()

if df_faturamento is not None:
    print(f"\nSalvando no Spark...")
    print(f"Estrutura final: {len(df_faturamento)} linhas, {len(df_faturamento.columns)} colunas")
    print(f"Colunas: {list(df_faturamento.columns)}")
    
    # Convertendo todas as colunas numéricas para DoubleType no Pandas antes de criar o Spark DataFrame
    # Isso ajuda a evitar o erro CANNOT_MERGE_TYPE
    for col_name in df_faturamento.columns:
        # Tenta converter para numérico, forçando float para evitar int/float mistos
        df_faturamento[col_name] = pd.to_numeric(df_faturamento[col_name], errors=\'coerce\')
        if df_faturamento[col_name].dtype == \'float64\':
            # Se for float, mantém como float. Se houver NaN, será float.
            pass
        elif df_faturamento[col_name].dtype == \'int64\':
            # Se for int, e não houver NaN, pode ser int. Mas para evitar conflito, converte para float.
            df_faturamento[col_name] = df_faturamento[col_name].astype(float)

    try:
        # O Spark inferirá o esquema do Pandas DataFrame, que agora tem tipos mais consistentes
        spark_df = spark.createDataFrame(df_faturamento)
        
        # Renomear colunas para o formato PySpark (se ainda não estiverem)
        for col_name in spark_df.columns:
            spark_df = spark_df.withColumnRenamed(col_name, limpar_nome_coluna_spark(col_name))

        # No Fabric, a tabela Delta será salva no Lakehouse associado ao notebook.
        # O caminho será algo como 'mssparklake://<workspace_id>/<lakehouse_id>/Tables/Faturamento_Geral'
        # ou simplesmente o nome da tabela se o Lakehouse for o padrão.
        spark.sql("DROP TABLE IF EXISTS Faturamento_Geral")
        spark_df.write.format("delta").mode("overwrite").saveAsTable("Faturamento_Geral")
        print(f"✅ Faturamento_Geral: {spark_df.count()} registros salvos")
        
        # Verifica se salvou corretamente
        contagem = spark.sql("SELECT COUNT(*) as total FROM Faturamento_Geral").collect()[0]["total"]
        print(f"✅ Verificação: {contagem} registros confirmados no Spark")
        
    except Exception as e:
        print(f"Erro ao salvar no Spark: {str(e)}")
        import traceback
        traceback.print_exc()
        
else:
    print("❌ Faturamento Geral: Falha no processamento")

# No Fabric, não é necessário parar a SparkSession explicitamente, pois ela é gerenciada pelo ambiente.
# spark.stop()


