# Pipelines de Dados

Notebooks e scripts para pipelines de transformação de dados seguindo a arquitetura Medallion (Landing → Bronze → Silver → Gold).

## Estrutura

### notebooks/
Jupyter notebooks organizados por camada de transformação.

**Pipeline Medallion**:

1. **LandingToBronze.ipynb** (13 KB)
   - Ingestão de dados brutos
   - Validação inicial
   - Salvamento em formato Bronze

2. **BronzeToSilver.ipynb** (12 KB)
   - Limpeza de dados
   - Padronização de tipos
   - Remoção de duplicatas
   - Aplicação de regras de negócio

3. **SilverToGold.ipynb** (9.7 KB)
   - Agregações
   - Cálculos de métricas
   - Dados prontos para consumo

**Outros Notebooks**:

4. **DAG.ipynb** (2.8 KB)
   - Definição de DAG (Directed Acyclic Graph)
   - Orquestração de pipeline

5. **Layout.ipynb** (13 KB)
   - Definição de schemas e layouts
   - Documentação de estruturas

6. **notebook_awamW_EXECUTADO.ipynb** (1.6 KB)
   - Notebook executado com resultados
   - Análise específica

### scripts/
Scripts Python para processamento e análise de dados.

**Scripts de Conversão**:
- `pyspark_converter.py` (19 KB) - Conversor de código PySpark
- `pyspark_converter_faturamento_fabric.py` (12 KB) - Conversor específico para faturamento

**Scripts de Análise**:
- `execute_analysis.py` (VERSÃO CORRIGIDA, 12 KB) - Executa análises estatísticas
- `create_presentation.py` (VERSÃO CORRIGIDA, 23 KB) - Gera apresentações HTML

**Scripts Utilitários**:
- `execute_notebook.py` (1.9 KB) - Executor de notebooks Jupyter via script
- `deepseek_python.py` (5.4 KB) - Script de análise específica

### configuration/
Arquivos JSON de configuração e metadados.

- `data_dictionary.json` (3.6 KB) - Dicionário de dados
- `data_lineage_tracker.json` (3.1 KB) - Rastreamento de linhagem de dados
- `exploratory_analysis.json` (2.7 KB) - Configurações de análise exploratória
- `final_data_dictionary.json` (5.1 KB) - Dicionário de dados final consolidado

## Como Usar

### Executar Pipeline Completo

```bash
# Opção 1: Via Jupyter
jupyter notebook

# Abrir e executar notebooks na ordem:
# 1. LandingToBronze.ipynb
# 2. BronzeToSilver.ipynb
# 3. SilverToGold.ipynb
```

```bash
# Opção 2: Via Script
cd scripts/
python execute_notebook.py ../notebooks/LandingToBronze.ipynb
python execute_notebook.py ../notebooks/BronzeToSilver.ipynb
python execute_notebook.py ../notebooks/SilverToGold.ipynb
```

### Executar Análise

```bash
cd scripts/
python execute_analysis.py --input ../data/stock_data.csv --output ../outputs/
```

### Gerar Apresentação

```bash
cd scripts/
python create_presentation.py --data ../data/processed/stock_data_final.csv
```

## Arquitetura Medallion

### Landing (Dados Brutos)
- Dados como chegam da origem
- Sem transformações
- Formato original

### Bronze (Dados Limpos)
- Validação de schema
- Conversão de tipos
- Preservação de dados originais

### Silver (Dados Processados)
- Limpeza aplicada
- Dados padronizados
- Enriquecimento com regras de negócio

### Gold (Dados Agregados)
- Métricas calculadas
- Dados agregados para consumo
- Prontos para BI e relatórios

## Dependências

Python 3.8+
- pandas
- numpy
- pyspark
- jupyter
- matplotlib/seaborn (visualizações)
- openpyxl (Excel)

Instalação:
```bash
pip install pandas numpy pyspark jupyter matplotlib seaborn openpyxl
```

## Configuração

Editar arquivos em `configuration/` conforme necessário:
- Ajustar dicionário de dados
- Configurar linhagem de dados
- Definir regras de análise exploratória

## Logs e Outputs

Resultados são salvos em:
- `../05_OUTPUTS/` - Relatórios e visualizações
- `../04_DADOS/processed/` - Dados processados

## Notas

- Sempre executar notebooks na ordem correta
- Verificar configurações antes de executar em produção
- Consultar `final_data_dictionary.json` para entender estrutura de dados
