# DEPRECATED - Arquivos Arquivados

Esta pasta contém arquivos e versões antigas que foram substituídos ou não são mais utilizados.

## Conteúdo

### Arquivos Duplicados

**DAG (1).ipynb**
- Duplicata de DAG.ipynb
- Versão ativa em: `../03_PIPELINES_DATA/notebooks/DAG.ipynb`
- Pode ser removido após revisão

**notebook_awamW (1).ipynb**
- Duplicata de notebook_awamW
- Versão executada em: `../03_PIPELINES_DATA/notebooks/notebook_awamW_EXECUTADO.ipynb`
- Pode ser removido após revisão

### Versões Antigas de Scripts

**create_presentation.py**
- Versão original com bugs
- Versão corrigida em: `../03_PIPELINES_DATA/scripts/create_presentation_fixed.py`
- Manter por 3 meses para referência, depois remover

**execute_analysis.py**
- Versão original com problemas
- Versão corrigida em: `../03_PIPELINES_DATA/scripts/execute_analysis_fixed.py`
- Manter por 3 meses para referência, depois remover

### Credenciais (REVISAR)

**incremental-409513-4eabd58e1b18.json**
- Arquivo de credencial Google Cloud
- **ATENÇÃO**: Verificar se credencial ainda é válida
- **AÇÃO RECOMENDADA**: Revogar credencial e remover arquivo
- **NUNCA** compartilhar este arquivo ou commitar em repositório

### Versões Antigas de Projetos

**pira_agent_v1.1/**
- Versão anterior do PIRA Agent
- Versão atual em: `../02_PIRA_AUTOMATION/Análise da Estrutura do PIRA do Sacolão/pira_agent/`
- Pode ser removido se nenhuma funcionalidade específica for necessária

## Política de Retenção

### Prazo
- Arquivos duplicados: Remover após 1 mês
- Versões antigas de scripts: Remover após 3 meses
- Versões antigas de projetos: Remover após 6 meses
- Credenciais: REVOGAR E REMOVER IMEDIATAMENTE

### Data de Arquivamento
27 de Outubro de 2025

### Próxima Revisão
- **Primeira revisão**: 27 de Novembro de 2025 (1 mês)
- **Segunda revisão**: 27 de Janeiro de 2026 (3 meses)
- **Limpeza final**: 27 de Abril de 2026 (6 meses)

## Antes de Remover

- [ ] Verificar se não há referências ativas a estes arquivos
- [ ] Confirmar que versões atualizadas funcionam corretamente
- [ ] Criar backup externo se necessário
- [ ] Revogar credenciais antes de remover

## Ações Imediatas Recomendadas

### CRÍTICO - Segurança
1. Revogar credencial `incremental-409513-4eabd58e1b18.json` no Google Cloud Console
2. Remover arquivo após revogação
3. Verificar se credencial foi usada em produção

### Limpeza
1. Testar versões "_fixed" dos scripts
2. Se funcionarem corretamente, remover versões originais em 30 dias
3. Documentar diferenças entre versões

## Restauração

Se precisar restaurar algum arquivo:
1. Verificar motivo da restauração
2. Copiar (não mover) de volta para pasta original
3. Documentar motivo da restauração
4. Avaliar se arquivo deve sair de DEPRECATED

## Notas

- Esta pasta NÃO deve ser commitada em repositório git
- Adicionar `DEPRECATED/` ao `.gitignore`
- Manter apenas localmente para referência temporária
