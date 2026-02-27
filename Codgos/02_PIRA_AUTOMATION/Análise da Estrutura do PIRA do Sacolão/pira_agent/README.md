# Agente de IA para PIRAs

Este projeto implementa um agente de IA para processamento automatizado de arquivos PIRA (Planilhas de Informações e Relatórios Analíticos) para diversos clientes.

## Funcionalidades

- Detecção automática do tipo de cliente com base na estrutura do arquivo PIRA
- Processamento específico para cada cliente (Jaguaré, Sacolão da Santa, etc.)
- Interface web simples para upload e processamento de arquivos
- Sistema de regras extensível baseado em JSON
- Suporte para múltiplos clientes

## Requisitos

- Python 3.10+
- Excel (para Windows)
- Pacotes Python listados em `requirements.txt`

## Instalação

1. Extraia o conteúdo do arquivo `.zip` para uma pasta de sua preferência (ex: `C:\PIRAAgent`).
2. Certifique-se de ter o Python 3.10+ instalado e adicionado ao PATH do Windows.
3. Abra a pasta `pira_agent`.
4. Execute o script `run.bat` dando um duplo clique nele. Este script irá:
   - Criar um ambiente virtual (se não existir).
   - Ativar o ambiente virtual.
   - Instalar as dependências listadas em `requirements.txt`.

Alternativamente, para instalação manual (via Prompt de Comando ou PowerShell):

1. Navegue até a pasta `pira_agent`:
   ```
   cd C:\PIRAAgent\pira_agent
   ```
2. Crie o ambiente virtual:
   ```
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   ```
   .\venv\Scripts\activate
   ```
4. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

## Uso

### Via Interface Web (Recomendado para Windows)

1. Execute o script `run.bat` dando um duplo clique nele. Ele cuidará da configuração do ambiente e iniciará o servidor web.
2. Após a mensagem "Iniciando o Agente de IA para PIRAs...", acesse a interface web em `http://localhost:5000` no seu navegador.
3. Faça upload do arquivo PIRA.
4. Opcionalmente, especifique o tipo de cliente (ou deixe em branco para detecção automática).
5. Clique em "Processar Arquivo".
6. Baixe o arquivo processado.

Para parar o servidor, feche a janela do Prompt de Comando que foi aberta pelo `run.bat` ou pressione `Ctrl+C` nela.

### Via Linha de Comando (Avançado)

1. Certifique-se de que o ambiente virtual está ativado:
   ```
   .\venv\Scripts\activate
   ```
2. Execute o script `main.py`:
   ```
   python main.py <caminho_do_arquivo_pira> [tipo_cliente]
   ```

Exemplo:
```
python main.py "C:/Documentos/PIRA Jaguaré_03.2025.xlsx" jaguare
```

## Estrutura do Projeto

- `core/`: Módulo principal
  - `processor.py`: Classes principais para processamento
- `rules/`: Arquivos de regras JSON para cada cliente
  - `jaguare.json`: Regras para o cliente Jaguaré
  - `sacolao.json`: Regras para o cliente Sacolão da Santa
  - `rainha.json`: Regras para o cliente Lojas Rainha
  - `padaria_real.json`: Regras para o cliente Padaria Real
- `templates/`: Templates HTML para a interface web
- `static/`: Arquivos estáticos (CSS, JavaScript)
- `app.py`: Aplicação web Flask
- `main.py`: Script para processamento via linha de comando
- `run.sh`: Script para instalação e execução

## Adicionando Suporte para Novos Clientes

1. Crie um arquivo de regras JSON em `rules/<nome_cliente>.json`
2. Adicione um método de detecção em `StructureDetector` na classe `core/processor.py`
3. Implemente as operações específicas necessárias em `RulesEngine` se as operações existentes não forem suficientes

## Formato das Regras JSON

```json
{
  "client": "nome_cliente",
  "rules": [
    {
      "sheet": "Nome_da_Aba",
      "operations": [
        {
          "type": "nome_operacao",
          "params": {
            "param1": "valor1",
            "param2": "valor2"
          }
        }
      ]
    }
  ]
}
```

## Operações Disponíveis

- `clear_range`: Limpa o conteúdo de um intervalo de células
- `copy_range`: Copia valores de um intervalo para outro
- `process_r2_analise`: Processa abas de análise de resultados
- `clear_range_except`: Limpa o conteúdo de um intervalo, exceto células específicas
- `update_inf_gerais`: Atualiza informações gerais em abas de informações

## Logs

Os logs são salvos em arquivos com o formato `pira_agent_YYYYMMDD_HHMMSS.log` no diretório de execução.

## Limitações Atuais

- Suporte completo apenas para clientes Jaguaré e Sacolão da Santa
- Suporte parcial para Lojas Rainha e Padaria Real (em desenvolvimento)
- Requer Excel instalado (Windows)
- Não suporta processamento em lote

## Próximos Passos

- Implementar suporte completo para mais clientes
- Adicionar análise de dados e geração de insights
- Implementar aprendizado de máquina para adaptação a novos formatos
- Criar interface de administração para gerenciamento de regras
