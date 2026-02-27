# Repositório de Códigos e Projetos

Repositório organizado contendo projetos de dados, automação e análises.

## Estrutura de Pastas

### 01_PROJETOS_GITHUB
Projetos clonados de repositórios GitHub públicos para referência e estudo.
- **Contoso-Data-Generator-V2**: Gerador de dados sintéticos para Power BI e Microsoft Fabric
- **microsoft-fabric-incremental-ingestion-files**: Pipeline de ingestão incremental para Fabric
- **Refresh_PowerBI_SemanticModels**: Scripts Python para refresh automático de modelos semânticos

### 02_PIRA_AUTOMATION
Sistema de automação para processamento de arquivos PIRA (Planilhas de Informações e Relatórios Analíticos).
- Sistema Flask web e CLI
- Suporte para múltiplos clientes (Jaguaré, Sacolão, Rainha, Padaria Real)
- Fluxo Power Automate para processamento mensal

### 03_PIPELINES_DATA
Notebooks e scripts para pipelines de transformação de dados (Medallion Architecture).
- **notebooks/**: Jupyter notebooks (Landing → Bronze → Silver → Gold)
- **scripts/**: Scripts Python para análise, conversão e apresentação
- **configuration/**: Dicionários de dados e configurações de linhagem

### 04_DADOS
Dados em diferentes estágios de processamento.
- **raw/**: Dados brutos extraídos
- **processed/**: Dados limpos, estruturados e finais
- **excel/**: Relatórios e dados em formato Excel

### 05_OUTPUTS
Resultados de processamento, relatórios e visualizações geradas.

### 06_VISUALIZACOES
Apresentações HTML e medidas Power BI.
- **MEDIDAS_POWER_BI/**: Medidas DAX em C# para inadimplência e moeda estrangeira

### 07_DOCUMENTACAO
Documentação geral, amostras e guias.

### 08_EXECUTAVEIS
Scripts executáveis (.bat) para automação de processos.

### DEPRECATED
Arquivos e versões antigas arquivadas. **Revisar periodicamente e remover após 3 meses.**

## Segurança

- Arquivos de credenciais foram removidos
- **IMPORTANTE**: Nunca commitar arquivos com padrão `*.apps.googleusercontent.com.json`
- Revisar pasta DEPRECATED para credenciais antes de compartilhar

## Última Reorganização

Data: 27 de Outubro de 2025
Ações realizadas:
- Remoção de arquivo de credencial Google OAuth
- Reorganização completa de 250+ arquivos
- Criação de estrutura organizada por tipo de projeto
- Arquivamento de duplicatas e versões antigas
