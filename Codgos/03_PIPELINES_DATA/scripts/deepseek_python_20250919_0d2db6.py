from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import pandas as pd
import os

# Inicializar Spark Session
spark = SparkSession.builder.appName("JaguarePIRAProcessing").getOrCreate()

# Definir caminho da pasta
folder_path = "/lakehouse/default/Files/Jaguaré/PIRA/"

# Listar arquivos da pasta (ignorando arquivos ocultos)
files = [f for f in os.listdir(folder_path) 
         if not f.startswith('.') and os.path.isfile(os.path.join(folder_path, f))]

# Função para processar cada arquivo Excel
def process_excel_file(file_path):
    try:
        # Ler a planilha específica do Excel
        pdf = pd.read_excel(file_path, sheet_name="R10_Balancete Gerencial", header=None)
        
        # Converter para Spark DataFrame
        df = spark.createDataFrame(pdf)
        
        # Renomear colunas para Column1, Column2, etc.
        df = df.toDF(*[f"Column{i+1}" for i in range(len(df.columns))])
        
        return df
    except Exception as e:
        print(f"Erro ao processar arquivo {file_path}: {str(e)}")
        return None

# Processar todos os arquivos
dataframes = []
for file in files:
    file_path = os.path.join(folder_path, file)
    df = process_excel_file(file_path)
    if df:
        dataframes.append(df)

# Combinar todos os DataFrames
if dataframes:
    combined_df = dataframes[0]
    for df in dataframes[1:]:
        combined_df = combined_df.union(df)
else:
    print("Nenhum arquivo válido encontrado")
    exit()

# Aplicar as transformações
# 1. Filtrar linhas
filtered_df = combined_df.filter(
    (col("Column8").isNotNull()) &
    (col("Column3") != "A VENCER") &
    (col("Column3") != "RESULTADO OPERACIONAL DE CAIXA") &
    (col("Column3") != "VENCIDOS ") &
    (col("Column2") != 10)
).select("Column2", "Column3", "Column8", "Column10")

# 2. Adicionar coluna condicional
def add_personalizar_column(column2, column8):
    if column2 == "RELATÓRIO DE LIQUIDEZ":
        return column2
    elif column8 == "PRAZO MÉDIO DE CONTAS A RECEBER":
        return column8
    elif column8 == "PRAZO MÉDIO DE ESTOQUES":
        return column8
    elif column8 == "PRAZO MÉDIO DE FORNECEDORES":
        return column8
    elif column8 == "DESPESAS A PAGAR":
        return column8
    elif column8 == "PRAZO MÉDIO DE PROVISIONADOS":
        return column8
    elif column8 == "CICLO FINANCEIRO":
        return column8
    else:
        return None

add_personalizar_udf = udf(add_personalizar_column, StringType())

filtered_df = filtered_df.withColumn(
    "Personalizar", 
    add_personalizar_udf(col("Column2"), col("Column8"))
)

# 3. Preencher valores para baixo (simulação do FillDown)
window_spec = Window.orderBy(monotonically_increasing_id()).rowsBetween(Window.unboundedPreceding, Window.currentRow)
filtered_df = filtered_df.withColumn(
    "Personalizar", 
    last("Personalizar", ignorenulls=True).over(window_spec)
)

# 4. Filtrar linhas novamente
filtered_df = filtered_df.filter(
    (col("Column8") != "CICLO FINANCEIRO") &
    (col("Column8") != "DESPESAS A PAGAR") &
    (col("Column8") != "PRAZO MÉDIO DE CONTAS A RECEBER") &
    (col("Column8") != "PRAZO MÉDIO DE ESTOQUES") &
    (col("Column8") != "PRAZO MÉDIO DE FORNECEDORES") &
    (col("Column8") != "PRAZO MÉDIO DE PROVISIONADOS")
).select("Personalizar", "Column8", "Column10")

# 5. Promover cabeçalhos e unpivot
# Para esta parte, é mais fácil usar pandas e converter de volta
pandas_df = filtered_df.toPandas()

# Renomear colunas para o unpivot
pandas_df.columns = ["RELATÓRIO_DE_LIQUIDEZ", "Data", "Valor"]

# Fazer o unpivot (melt no pandas)
unpivoted_df = pandas_df.melt(
    id_vars=["RELATÓRIO_DE_LIQUIDEZ"], 
    value_vars=["Data", "Valor"],
    var_name="Tipo", 
    value_name="Valor"
)

# Converter de volta para Spark DataFrame
final_df = spark.createDataFrame(unpivoted_df)

# 6. Converter tipos de dados
final_df = final_df.withColumn("Data", to_date(col("Data")))
final_df = final_df.withColumn("Valor", col("Valor").cast(DoubleType()))

# 7. Ordenar por data
final_df = final_df.orderBy("Data")

# 8. Filtragem com padrão dinâmico
# Obter datas únicas
unique_dates = final_df.select("Data").distinct().orderBy("Data")

# Adicionar índice às datas únicas
unique_dates_with_index = unique_dates.withColumn("Indice", monotonically_increasing_id())

# Contar total de linhas
total_rows = unique_dates_with_index.count()

# Função para gerar padrão dinâmico
def generate_pattern(num_rows):
    pattern = []
    for i in range(num_rows - 2):
        pattern.append(1 if i % 2 == 0 else 0)
    pattern.extend([1, 1])  # Adicionar dois 1s no final
    return pattern

# Gerar padrão
pattern = generate_pattern(total_rows)

# Criar DataFrame com padrão
pattern_df = unique_dates_with_index.rdd.zipWithIndex().map(
    lambda x: (x[0]["Data"], pattern[x[1]] if x[1] < len(pattern) else 0)
).toDF(["Data", "Manter"])

# Filtrar datas que devem ser mantidas
dates_to_keep = pattern_df.filter(col("Manter") == 1).select("Data")

# Aplicar filtro final
final_filtered_df = final_df.join(dates_to_keep, "Data", "inner")

# 9. Substituir valor
final_filtered_df = final_filtered_df.withColumn(
    "RELATÓRIO_DE_LIQUIDEZ", 
    regexp_replace(col("RELATÓRIO_DE_LIQUIDEZ"), "0VENCIDOS TOTAL", "VENCIDOS TOTAL")
)

# Mostrar resultado
final_filtered_df.show()

# Salvar resultado se necessário
# final_filtered_df.write.format("delta").save("/caminho/para/salvar/resultado")