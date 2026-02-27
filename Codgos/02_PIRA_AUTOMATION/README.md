# PIRA Automation - Sistema de Processamento de Planilhas

Sistema de automação para processamento de arquivos PIRA (Planilhas de Informações e Relatórios Analíticos) para múltiplos clientes.

## Conteúdo

### Análise da Estrutura do PIRA do Sacolão/
Pasta principal contendo o sistema PIRA Agent com todos os componentes.

#### pira_agent/
Sistema Python Flask para processamento automatizado de arquivos PIRA.

**Estrutura**:
- `app.py` - Aplicação web Flask
- `main.py` - Interface CLI
- `core/` - Lógica de processamento
- `rules/` - Regras específicas por cliente (JSON)
- `templates/` - Templates HTML da interface web
- `static/` - Assets estáticos
- `tests/` - Testes unitários
- `uploads/` - Pasta para uploads de arquivos
- `venv/` - Ambiente virtual Python

**Clientes Suportados**:
- Jaguaré (`rules/jaguare.json`)
- Sacolão da Santa (`rules/sacolao.json`)
- Rainha (`rules/rainha.json`)
- Padaria Real (`rules/padaria_real.json`)

### pira_automation.json
Fluxo Power Automate para execução automática mensal.

**Funcionalidades**:
- Gatilho: Primeira segunda-feira de cada mês
- Verifica existência de pasta específica
- Executa script Python de processamento
- Atualiza dataset Power BI
- Envia notificação no Teams

**Configuração Necessária**:
- Team ID
- Channel ID
- Workspace ID
- Dataset ID

## Como Usar

### Modo Web (Flask)

```bash
cd "Análise da Estrutura do PIRA do Sacolão/pira_agent"

# Windows
run.bat

# Linux/Mac
./run.sh
```

Acessar: `http://localhost:5000`

### Modo CLI

```bash
cd "Análise da Estrutura do PIRA do Sacolão/pira_agent"
python main.py --input arquivo_pira.xlsx --cliente sacolao
```

### Opções CLI

- `--input`: Arquivo PIRA de entrada
- `--cliente`: Cliente (jaguare, sacolao, rainha, padaria_real)
- `--output`: Pasta de saída (opcional)

## Dependências

Consultar `requirements.txt` no diretório pira_agent:
- Flask
- xlwings
- pandas
- openpyxl

Instalação:
```bash
pip install -r requirements.txt
```

## Estrutura de Regras (JSON)

Cada cliente possui um arquivo JSON com regras de processamento:

```json
{
  "cliente": "Nome do Cliente",
  "colunas": [...],
  "validacoes": [...],
  "transformacoes": [...]
}
```

## Logs

Logs de execução são salvos na pasta raiz:
- `pira_agent.log`
- `pira_processing_[data].log`

## Documentação Adicional

Consultar PDF incluído: `SCR-39212141811-202505-06052025-122436297-85557809.pdf`

## Versão

Versão Atual: 1.1 (ativa)
Versão Anterior: 1.1 (arquivada em DEPRECATED/)

## Manutenção

Para adicionar novo cliente:
1. Criar arquivo JSON em `rules/[nome_cliente].json`
2. Definir estrutura de colunas e validações
3. Atualizar documentação
