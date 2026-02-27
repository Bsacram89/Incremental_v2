'''
Este script Python converte o código M (Power Query) fornecido para PySpark.
'''

from pyspark.sql import SparkSession
from pyspark.sql.functions import udf, col, lit, monotonically_increasing_id
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DateType, DoubleType, BooleanType
import pandas as pd
from datetime import datetime
import os

# Inicializar SparkSession
spark = SparkSession.builder.appName("PowerQueryToPySpark").getOrCreate()

# Caminho da pasta onde os arquivos Excel estão localizados
folder_path = "/lakehouse/default/Files/Jaguaré/PIRA/"

def read_excel_sheet(file_path: str, sheet_name: str = "R10_Balancete Gerencial") -> pd.DataFrame:
    """
    Lê uma planilha específica de um arquivo Excel e retorna um DataFrame do Pandas.
    """
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name, engine="openpyxl")
        return df
    except Exception as e:
        print(f"Erro ao ler o arquivo {file_path} ou a planilha {sheet_name}: {e}")
        return pd.DataFrame()

# 1. Origem e Navegação (Leitura de arquivos Excel)
# No Power Query, ele lê todos os arquivos da pasta e filtra por 


arquivos não ocultos. No PySpark, vamos listar os arquivos e processá-los.

# Listar todos os arquivos na pasta
excel_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith(('.xlsx', '.xls'))]

# Schema para os dados do Excel (ajuste conforme necessário)
# Este é um esquema de exemplo, o esquema real deve ser inferido ou definido com base nos dados do Excel.
# Para simplificar, vamos usar um esquema genérico para a leitura inicial.
# O Power Query usa 'Column2', 'Column3', 'Column8', 'Column10', então vamos tentar inferir isso.

# Função para processar um único arquivo Excel
def process_excel_file(file_path: str) -> pd.DataFrame:
    df_excel = read_excel_sheet(file_path)
    if not df_excel.empty:
        # Renomear colunas para corresponder aos nomes usados no Power Query, se necessário
        # Ou, mais robusto, usar os nomes reais das colunas após a leitura
        # Por enquanto, vamos assumir que as colunas relevantes são as que o Power Query se refere.
        # Precisamos garantir que as colunas 'Column2', 'Column3', 'Column8', 'Column10' existam.
        # Se o Excel não tiver cabeçalhos, o pandas lerá como 0, 1, 2, ...
        # Para simular o comportamento do Power Query, vamos renomear as colunas se elas não tiverem nomes específicos.
        
        # Exemplo de renomeação se os cabeçalhos não forem os esperados
        # if 'Column2' not in df_excel.columns and 1 in df_excel.columns:
        #     df_excel = df_excel.rename(columns={1: 'Column2', 2: 'Column3', 7: 'Column8', 9: 'Column10'})
        
        # Selecionar as colunas que o Power Query usa
        # Vamos tentar inferir as colunas com base no contexto do Power Query
        # Power Query usa Column2, Column3, Column8, Column10
        # Assumindo que o Excel tem cabeçalhos, precisamos saber os nomes reais.
        # Se não tiver cabeçalhos, pandas usará índices numéricos.
        # Para o propósito de conversão, vamos assumir que as colunas são nomeadas 'Column2', 'Column3', 'Column8', 'Column10' 
        # ou que podemos mapeá-las por índice.
        
        # Para o balancete gerencial, as colunas são geralmente:
        # Column2: Tipo de Relatório (e.g., 'RELATÓRIO DE LIQUIDEZ')
        # Column3: Descrição (e.g., 'A VENCER', 'RESULTADO OPERACIONAL DE CAIXA')
        # Column8: Item (e.g., 'PRAZO MÉDIO DE CONTAS A RECEBER')
        # Column10: Valor
        
        # Vamos tentar padronizar os nomes das colunas para facilitar o mapeamento
        # Isso é uma suposição, o ideal seria ter o arquivo Excel para verificar os cabeçalhos.
        # Se o arquivo Excel não tiver cabeçalhos, o pandas atribuirá 0, 1, 2, ...
        # O código M usa Column2, Column3, Column8, Column10. Vamos mapear para índices.
        # Column2 -> índice 1 (segunda coluna)
        # Column3 -> índice 2 (terceira coluna)
        # Column8 -> índice 7 (oitava coluna)
        # Column10 -> índice 9 (décima coluna)
        
        # Renomear colunas do DataFrame do Pandas para corresponder ao Power Query
        # Isso é uma suposição baseada na forma como o Power Query referencia as colunas.
        # Se o Excel tiver cabeçalhos, esta parte precisará ser ajustada.
        df_excel.columns = [f"Column{i+1}" for i in range(len(df_excel.columns))]
        
        # Selecionar as colunas relevantes
        cols_to_select = ['Column2', 'Column3', 'Column8', 'Column10']
        df_excel_selected = df_excel[cols_to_select] if all(col in df_excel.columns for col in cols_to_select) else pd.DataFrame()
        
        return df_excel_selected
    return pd.DataFrame()

# Processar todos os arquivos Excel e combinar em um único DataFrame do Pandas
all_data_pd = pd.concat([process_excel_file(f) for f in excel_files if process_excel_file(f) is not None], ignore_index=True)

# Converter o DataFrame do Pandas para DataFrame do PySpark
# Inferir esquema do Pandas DataFrame para PySpark DataFrame
if not all_data_pd.empty:
    spark_df = spark.createDataFrame(all_data_pd)
else:
    # Definir um esquema padrão se não houver dados para inferir
    schema = StructType([
        StructField("Column2", StringType(), True),
        StructField("Column3", StringType(), True),
        StructField("Column8", StringType(), True),
        StructField("Column10", DoubleType(), True) # Assumindo que Column10 é o valor e pode ser numérico
    ])
    spark_df = spark.createDataFrame([], schema)

# Mostrar o esquema e algumas linhas para verificação
print("Schema do DataFrame PySpark inicial:")
spark_df.printSchema()
print("Primeiras linhas do DataFrame PySpark inicial:")
spark_df.show(5, truncate=False)

# 2. Base e Personalização Adicionada (Transformações de dados)
# No Power Query, a função 'getdistinctPositions' é aplicada a cada linha da coluna 'Content'.
# Isso é complexo de replicar diretamente no PySpark com UDFs que leem arquivos.
# A abordagem que usamos acima (ler todos os arquivos e concatenar) já simula a 'Base' inicial.

# Agora, vamos focar na lógica interna da função 'getdistinctPositions' que é aplicada à 'Tabela'.
# Esta função realiza filtragens, preenchimento para baixo, promoção de cabeçalhos e unpivot.

# Mapeando as operações internas da função 'getdistinctPositions' para PySpark:
# #"Linhas Filtradas1" = Table.SelectRows(Tabela, each ([Column8] <> null) and ([Column3] <> "A VENCER" and [Column3] <> "RESULTADO OPERACIONAL DE CAIXA" and [Column3] <> "VENCIDOS ") and ([Column2] <> 10))

filtered_df = spark_df.filter(
    (col("Column8").isNotNull()) &
    (~col("Column3").isin("A VENCER", "RESULTADO OPERACIONAL DE CAIXA", "VENCIDOS ")) &
    (col("Column2") != "10") # Assumindo que Column2 pode ser string ou numérico e 10 é um valor específico
)

# #"Coluna Condicional Adicionada" = Table.AddColumn(#"Linhas Filtradas1", "Personalizar", each if [Column2] = "RELATÓRIO DE LIQUIDEZ" then [Column2] else if [Column8] = "PRAZO MÉDIO DE CONTAS A RECEBER" then [Column8] else if [Column8] = "PRAZO MÉDIO DE ESTOQUES" then [Column8] else if [Column8] = "PRAZO MÉDIO DE FORNECEDORES" then [Column8] else if [Column8] = "DESPESAS A PAGAR" then [Column8] else if [Column8] = "PRAZO MÉDIO DE PROVISIONADAS" then [Column8] else if [Column8] = "CICLO FINANCEIRO" then [Column8] else null)

from pyspark.sql.functions import when

conditional_column_df = filtered_df.withColumn("Personalizar", 
    when(col("Column2") == "RELATÓRIO DE LIQUIDEZ", col("Column2"))
    .when(col("Column8") == "PRAZO MÉDIO DE CONTAS A RECEBER", col("Column8"))
    .when(col("Column8") == "PRAZO MÉDIO DE ESTOQUES", col("Column8"))
    .when(col("Column8") == "PRAZO MÉDIO DE FORNECEDORES", col("Column8"))
    .when(col("Column8") == "DESPESAS A PAGAR", col("Column8"))
    .when(col("Column8") == "PRAZO MÉDIO DE PROVISIONADAS", col("Column8"))
    .when(col("Column8") == "CICLO FINANCEIRO", col("Column8"))
    .otherwise(lit(None))
)

# #"Preenchido Abaixo" = Table.FillDown(#"Coluna Condicional Adicionada",{"Personalizar"})
# PySpark não tem um 'fill down' direto como o Power Query. Precisamos usar uma Window Function.
from pyspark.sql.window import Window

# Para 'fill down', precisamos de uma coluna de ordenação. O Power Query implicitamente mantém a ordem.
# Vamos adicionar uma coluna de índice para simular a ordem.
conditional_column_df = conditional_column_df.withColumn("__row_id", monotonically_increasing_id())

window_spec = Window.orderBy("__row_id")

# UDF para preencher valores nulos para baixo
def fill_down_udf(personalizar_col):
    # Esta UDF é mais complexa porque precisa de estado.
    # No PySpark, fill_down é geralmente feito com window functions e last_value(ignorenulls=True).
    # No entanto, last_value(ignorenulls=True) preenche para cima. Para preencher para baixo, é mais complicado.
    # Uma abordagem comum é reverter a ordem, preencher para cima e reverter novamente.
    # Ou usar uma UDF com um estado, o que não é ideal para desempenho em PySpark.
    
    # Vamos tentar a abordagem de window function com last_value(ignorenulls=True) e reverter.
    # Primeiro, preencher para cima (last_value com ordem normal)
    # Depois, preencher para baixo (first_value com ordem reversa)
    
    # Para simplificar, vamos usar uma abordagem que simula o fill down de forma mais direta, mas pode ser menos performática para grandes datasets.
    # Uma UDF para isso seria ineficiente. A melhor forma é com Window Functions.
    
    # Implementação de fill_down com Window Functions:
    # 1. Preencher para cima (backward fill) usando last_value ignorando nulos
    # 2. Preencher para baixo (forward fill) usando first_value ignorando nulos
    # A ordem é importante. O Power Query faz um preenchimento para baixo.
    
    # Abordagem para fill down: 
    # 1. Criar uma coluna auxiliar que é o valor não nulo mais recente.
    # 2. Usar essa coluna para preencher os nulos.
    
    # A forma mais comum de fazer fill_down em PySpark é com last_value(ignorenulls=True) e uma janela que vai do início até a linha atual.
    # Mas isso preenche para cima. Para preencher para baixo, precisamos de uma janela que vai da linha atual até o final.
    # Ou, como mencionado, reverter a ordem, preencher para cima e reverter novamente.
    
    # Vamos usar uma abordagem mais direta com last_value, mas com a janela correta.
    # Para fill down, precisamos do último valor não nulo *antes ou na linha atual*.
    # Isso é last_value(col, ignorenulls=True) com uma janela não particionada e ordenada.
    
    # A janela deve ir do início até a linha atual para preencher para baixo.
    # Window.unboundedPreceding significa do início, 0 significa a linha atual.
    window_fill_down = Window.orderBy("__row_id").rowsBetween(Window.unboundedPreceding, Window.currentRow)
    
    filled_down_df = conditional_column_df.withColumn("Personalizar", 
        last_value(col("Personalizar"), ignorenulls=True).over(window_fill_down)
    )

# Removendo a coluna auxiliar
filled_down_df = filled_down_df.drop("__row_id")

# #"Linhas Filtradas2" = Table.SelectRows(#"Preenchido Abaixo", each ([Column8] <> "CICLO FINANCEIRO" and [Column8] <> "DESPESAS A PAGAR" and [Column8] <> "PRAZO MÉDIO DE CONTAS A RECEBER" and [Column8] <> "PRAZO MÉDIO DE ESTOQUES" and [Column8] <> "PRAZO MÉDIO DE FORNECEDORES" and [Column8] <> "PRAZO MÉDIO DE PROVISIONADAS"))[[Personalizar],[Column8],[Column10]]

filtered_df_2 = filled_down_df.filter(
    ~col("Column8").isin(
        "CICLO FINANCEIRO", 
        "DESPESAS A PAGAR", 
        "PRAZO MÉDIO DE CONTAS A RECEBER", 
        "PRAZO MÉDIO DE ESTOQUES", 
        "PRAZO MÉDIO DE FORNECEDORES", 
        "PRAZO MÉDIO DE PROVISIONADAS"
    )
).select("Personalizar", "Column8", "Column10")

# #"Cabeçalhos Promovidos" = Table.PromoteHeaders(#"Linhas Filtradas2", [PromoteAllScalars=true])
# No PySpark, se as colunas já estão nomeadas, não precisamos de 'PromoteHeaders'.
# O Power Query aqui está promovendo os valores da primeira linha como cabeçalhos.
# Como já selecionamos as colunas "Personalizar", "Column8", "Column10", e "Personalizar" é o novo cabeçalho principal,
# precisamos reestruturar os dados para que "Personalizar" se torne a chave para o unpivot.

# O Power Query faz um unpivot onde "RELATÓRIO DE LIQUIDEZ" é a coluna de identificação.
# No nosso caso, "Personalizar" é a coluna que contém "RELATÓRIO DE LIQUIDEZ" ou outros itens.
# A operação de "PromoteHeaders" no Power Query é complexa aqui porque ela está sendo aplicada a um subconjunto de colunas.
# Basicamente, ele pega a primeira linha de `filtered_df_2` e usa como cabeçalho.
# Isso significa que `Personalizar` se tornaria o nome de uma coluna, e os valores de `Column8` e `Column10` seriam os dados.

# Para simular isso, precisamos de um `pivot` ou `unpivot` mais inteligente.
# O Power Query faz: `Table.PromoteHeaders(#"Linhas Filtradas2", [PromoteAllScalars=true])`
# Isso significa que a primeira linha de `filtered_df_2` se torna o cabeçalho.
# Exemplo: se a primeira linha for ('RELATÓRIO DE LIQUIDEZ', 'Ativo Circulante', 100.0)
# As colunas se tornariam 'RELATÓRIO DE LIQUIDEZ', 'Ativo Circulante', '100.0'
# Isso é um pouco incomum. Geralmente, 'PromoteHeaders' é usado no início do processo.

# Vamos reinterpretar a intenção: A coluna 'Personalizar' contém o nome do relatório ou categoria principal.
# 'Column8' contém o item específico e 'Column10' o valor.
# O `PromoteHeaders` aqui parece estar transformando a estrutura de forma que 'Personalizar' se torna uma coluna de identificação
# e os valores de 'Column8' e 'Column10' são os dados que serão unpivoted.

# Se a intenção é que 'Personalizar' seja a chave e 'Column8' e 'Column10' sejam os atributos/valores,
# então o `PromoteHeaders` é um passo intermediário para o `UnpivotOtherColumns`.

# #"Outras Colunas Não Dinâmicas" = Table.UnpivotOtherColumns(#"Cabeçalhos Promovidos", {"RELATÓRIO DE LIQUIDEZ"}, "Data", "Valor")
# Isso significa que todas as colunas, exceto "RELATÓRIO DE LIQUIDEZ", serão unpivoted.
# As colunas resultantes serão "Data" (para os nomes das colunas unpivoted) e "Valor" (para os valores).

# Para replicar isso no PySpark, precisamos que a coluna "Personalizar" seja a coluna de identificação.
# E as colunas "Column8" e "Column10" sejam as colunas a serem unpivoted.

# Primeiro, vamos renomear "Personalizar" para "RELATÓRIO DE LIQUIDEZ" para corresponder ao Power Query.
renamed_for_unpivot_df = filtered_df_2.withColumnRenamed("Personalizar", "RELATÓRIO DE LIQUIDEZ")

# Agora, aplicar o unpivot (melt) no PySpark
# As colunas a serem unpivoted são "Column8" e "Column10".
# A coluna de identificação é "RELATÓRIO DE LIQUIDEZ".

from pyspark.sql.functions import expr

unpivoted_df = renamed_for_unpivot_df.select("RELATÓRIO DE LIQUIDEZ", 
    expr("stack(2, 'Column8', Column8, 'Column10', Column10) as (Data, Valor)")
)

# #"Tabela Expandido" = Table.ExpandTableColumn(#"Personalização Adicionada", "Tabela", {"RELATÓRIO DE LIQUIDEZ", "Data", "Valor"}, {"RELATÓRIO DE LIQUIDEZ", "Data", "Valor"})
# Esta etapa no Power Query expande a coluna 'Tabela' que foi gerada pela função 'getdistinctPositions'.
# Como já estamos construindo o DataFrame de forma plana no PySpark, esta etapa é implicitamente tratada.
# O `unpivoted_df` já tem as colunas "RELATÓRIO DE LIQUIDEZ", "Data", "Valor".

# #"Tipo Alterado" = Table.TransformColumnTypes(#"Tabela Expandido",{{"RELATÓRIO DE LIQUIDEZ", type text}, {"Data", type date}, {"Valor", type number}})

final_transformed_df = unpivoted_df.withColumn("RELATÓRIO DE LIQUIDEZ", col("RELATÓRIO DE LIQUIDEZ").cast(StringType())) \
                                   .withColumn("Data", col("Data").cast(DateType())) \
                                   .withColumn("Valor", col("Valor").cast(DoubleType()))

# Mostrar o esquema e algumas linhas para verificação após as transformações iniciais
print("Schema do DataFrame PySpark após transformações iniciais:")
final_transformed_df.printSchema()
print("Primeiras linhas do DataFrame PySpark após transformações iniciais:")
final_transformed_df.show(5, truncate=False)

# 3. Filtragem com Padrão Dinâmico Automático
# TabelaOrdenada = Table.Sort(#"Tipo Alterado", {{"Data", Order.Ascending}})

sorted_df = final_transformed_df.orderBy(col("Data").asc())

# DatasUnicas = Table.SelectColumns(Table.Distinct(TabelaOrdenada, {"Data"}), {"Data"})

unique_dates_df = sorted_df.select("Data").distinct()

# ComIndice = Table.AddIndexColumn(DatasUnicas, "Indice", 0, 1, Int64.Type)
# No PySpark, `monotonically_increasing_id` ou `row_number` com Window Function podem ser usados.
# `monotonically_increasing_id` é mais simples para um índice global.

indexed_dates_df = unique_dates_df.withColumn("Indice", monotonically_increasing_id())

# TotalLinhas = Table.RowCount(ComIndice)
total_rows = indexed_dates_df.count()

# Função para gerar padrão dinâmico CORRIGIDA
# GerarPadrao = (numLinhas as number) as list => ...

def generate_pattern(num_linhas: int) -> list:
    pattern_alternado = [1 if i % 2 == 0 else 0 for i in range(num_linhas - 2)]
    pattern_completo = pattern_alternado + [1, 1]
    return pattern_completo

pattern_gerado = generate_pattern(total_rows)

# Adicionar coluna que indica se deve manter usando o padrão gerado
# ComPadrao = Table.AddColumn(ComIndice, "Manter", each ...)

# Criar um DataFrame Spark a partir da lista de padrões para fazer um join
pattern_df = spark.createDataFrame(pd.DataFrame({"Indice": range(len(pattern_gerado)), "Manter_Pattern": pattern_gerado}))

# Juntar o DataFrame de datas com o DataFrame de padrões
indexed_dates_with_pattern_df = indexed_dates_df.join(pattern_df, on="Indice", how="left")

# A lógica do Power Query é: if indice < List.Count(PadraoGerado) then PadraoGerado{indice} = 1 else false
# Isso já está implícito no join e na criação do pattern_df.
# Agora, filtrar as datas que devem ser mantidas
dates_to_keep_df = indexed_dates_with_pattern_df.filter(col("Manter_Pattern") == 1)

# Criar lista de datas para filtrar (coletar para o driver)
list_datas = [row.Data for row in dates_to_keep_df.select("Data").collect()]

# Aplicar filtro final na tabela original
# #"Linhas Filtradas2" = Table.SelectRows(TabelaOrdenada, each List.Contains(ListaDatas, [Data]))

final_filtered_df = sorted_df.filter(col("Data").isin(list_datas))

# 4. Substituição de Valor
# #"Valor SubstituÃ­do" = Table.ReplaceValue(#"Linhas Filtradas2","0VENCIDOS TOTAL","VENCIDOS TOTAL",Replacer.ReplaceText,{"RELATÓRIO DE LIQUIDEZ"})

final_df = final_filtered_df.replace("0VENCIDOS TOTAL", "VENCIDOS TOTAL", "RELATÓRIO DE LIQUIDEZ")

# Mostrar o DataFrame final
print("Schema do DataFrame PySpark final:")
final_df.printSchema()
print("Primeiras linhas do DataFrame PySpark final:")
final_df.show(20, truncate=False)

# Parar a SparkSession
spark.stop()


