# Dados

Dados em diferentes estágios de processamento organizados por camada.

## Estrutura

### raw/
Dados brutos sem processamento.

**Arquivos**:
- `stock_data_raw.csv` (818 KB)
  - Dados de estoque extraídos diretamente da origem
  - Sem limpeza ou transformações
  - Preservar sempre como backup

### processed/
Dados processados em diferentes estágios.

**Arquivos**:
- `stock_data_cleaned.csv` (813 KB)
  - Dados limpos
  - Valores inválidos tratados
  - Tipos de dados corrigidos

- `stock_data_structured.csv` (856 KB)
  - Dados estruturados conforme schema
  - Colunas padronizadas
  - Enriquecimento aplicado

- `stock_data_final.csv` (813 KB)
  - Versão final para análise
  - Todas as transformações aplicadas
  - Pronto para consumo

### excel/
Dados e relatórios em formato Excel.

**Arquivos**:
- `Relatorio_estoque.xlsx` (647 KB)
  - Relatório completo de estoque
  - Múltiplas abas
  - Formatação e fórmulas

- `stock_data_cleaned.xlsx` (590 KB)
  - Dados limpos em formato Excel
  - Para compartilhamento e análise manual

## Diferenças Entre Versões

### stock_data_raw.csv vs stock_data_cleaned.csv
- **Raw**: Dados brutos sem tratamento
- **Cleaned**: Valores nulos tratados, tipos corrigidos, duplicatas removidas

### stock_data_cleaned.csv vs stock_data_structured.csv
- **Cleaned**: Dados limpos básicos
- **Structured**: Schema aplicado, colunas renomeadas, dados enriquecidos

### stock_data_structured.csv vs stock_data_final.csv
- **Structured**: Estrutura definida
- **Final**: Versão consolidada final com todas as transformações

## Como Usar

### Para Análise
Use sempre `stock_data_final.csv` ou `Relatorio_estoque.xlsx`

### Para Reprocessamento
Inicie com `stock_data_raw.csv` e aplique pipeline completo

### Para Compartilhamento
Use arquivos Excel em `excel/` para facilitar visualização

## Políticas de Dados

### Backup
- **raw/** - NUNCA modificar, apenas adicionar novos arquivos
- Manter backup externo de dados raw

### Versionamento
- Dados processados podem ser regenerados a partir de raw
- Documentar transformações em notebooks

### Limpeza
- Revisar pasta `processed/` mensalmente
- Remover versões intermediárias antigas
- Manter apenas versão final

## Metadados

Consultar dicionários de dados em:
- `../03_PIPELINES_DATA/configuration/data_dictionary.json`
- `../03_PIPELINES_DATA/configuration/final_data_dictionary.json`

## Tamanho Total

- **raw/**: ~818 KB
- **processed/**: ~2.4 MB
- **excel/**: ~1.2 MB
- **Total**: ~4.4 MB

## Atualização

Última atualização: Maio 2025
Fonte: [Especificar fonte dos dados]
Frequência de atualização: [Mensal/Semanal/Sob demanda]
