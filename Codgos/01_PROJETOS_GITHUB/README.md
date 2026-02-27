# Projetos GitHub

Esta pasta contém projetos clonados de repositórios públicos do GitHub para referência, estudo e uso em projetos locais.

## Projetos Incluídos

### Contoso-Data-Generator-V2
**Linguagem**: C# (.NET)
**Repositório Original**: [Link para repositório oficial]
**Descrição**: Gerador de dados sintéticos para demonstrações e testes com Power BI e Microsoft Fabric.

**Principais Funcionalidades**:
- Geração de dados em CSV e Parquet
- Modelos de dados para cenários empresariais
- Scripts SQL para criação de tabelas
- Configurações personalizáveis

**Como Usar**:
1. Navegar para `Contoso-Data-Generator-V2-main/Contoso-Data-Generator-V2-main/`
2. Consultar README.md específico do projeto
3. Executar scripts em `scripts/build_data/`

---

### microsoft-fabric-incremental-ingestion-files
**Linguagem**: Python, Jupyter Notebook
**Repositório Original**: [Link para repositório oficial]
**Descrição**: Pipeline de ingestão incremental de arquivos para Microsoft Fabric usando formato Delta.

**Principais Funcionalidades**:
- Conversão de CSV para Delta Lake
- Ingestão incremental automática
- Scripts de geração de dados de exemplo (absenteeism data)

**Como Usar**:
1. Navegar para pasta do projeto
2. Abrir `NB_CsvToDelta.ipynb` no Jupyter ou Fabric
3. Executar scripts em `scripts/` para geração de dados

---

### Refresh_PowerBI_SemanticModels
**Linguagem**: Python
**Repositório Original**: [Link para repositório oficial]
**Descrição**: Automação de refresh de modelos semânticos do Power BI usando Python e APIs REST.

**Principais Funcionalidades**:
- 7 scripts progressivos (1_simple_refresh.py até 7_refresh_partitions.py)
- Refresh completo, parcial e por partições
- Monitoramento de status de refresh
- Integração com SQL queries

**Como Usar**:
1. Navegar para `scripts/` dentro do projeto
2. Consultar documentação específica de cada script
3. Configurar credenciais e IDs de workspace/dataset

---

## Notas Importantes

- Estes projetos são **referências externas** e podem estar desatualizados
- Consultar repositórios originais para versões mais recentes
- Não modificar diretamente - criar fork ou cópia separada para customizações
- Revisar licenças antes de usar em projetos comerciais

## Atualização

Para atualizar qualquer projeto:
```bash
cd [nome-do-projeto]
git pull origin main
```

Se não for repositório git:
- Baixar nova versão do repositório original
- Substituir pasta existente
