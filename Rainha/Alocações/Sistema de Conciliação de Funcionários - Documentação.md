# Sistema de Conciliação de Funcionários - Documentação

## Visão Geral

O Sistema de Conciliação de Funcionários é uma aplicação web que permite comparar duas listas de funcionários para identificar:
- Correspondências exatas entre as listas
- Nomes similares que podem representar o mesmo funcionário
- Mudanças de alocação ou empresa
- Funcionários novos (presentes apenas na lista atual)
- Funcionários removidos (presentes apenas na lista anterior)

## Melhorias Implementadas

A versão atual inclui as seguintes melhorias:

1. **Suporte nativo a arquivos Excel (.xlsx, .xls)** - Não é mais necessário converter para CSV
2. **Interface responsiva** - Compatível com diferentes tamanhos de tela
3. **Algoritmo de correspondência aprimorado** - Melhor detecção de nomes similares
4. **Tratamento de erros robusto** - Validações e feedback detalhado
5. **Exportação avançada** - Opções para Excel, CSV e JSON
6. **Configurações personalizáveis** - Ajuste de similaridade e mapeamento de colunas
7. **Ajuda integrada** - Documentação acessível diretamente na aplicação

## Implantação Permanente

### Opção 1: Implantação no Vercel (Recomendado)

1. Crie uma conta no [Vercel](https://vercel.com/) se ainda não tiver
2. Instale o Vercel CLI: `npm i -g vercel`
3. No diretório do projeto, execute: `vercel login`
4. Para implantar, execute: `vercel`
5. Siga as instruções na tela para completar a implantação
6. Após a implantação, você receberá uma URL permanente para acessar o sistema

### Opção 2: Implantação no Netlify

1. Crie uma conta no [Netlify](https://www.netlify.com/) se ainda não tiver
2. Execute `npm run build` para gerar a versão de produção
3. Arraste e solte a pasta `out` gerada para o painel do Netlify
4. Alternativamente, conecte seu repositório Git para implantação contínua

### Opção 3: Execução Local

Para executar o sistema localmente:

1. Execute o arquivo `iniciar-conciliacao.bat` (Windows)
2. Ou execute manualmente:
   ```
   npm install
   npm run dev
   ```
3. Acesse http://localhost:3000 no navegador

## Uso do Sistema

### Importando Arquivos

1. Clique no botão "Importar Listas" no cabeçalho
2. Selecione o arquivo atual (nova lista de funcionários)
3. Selecione o arquivo anterior (lista de referência)
4. Clique em "Processar Conciliação"

Formatos suportados:
- Excel (.xlsx, .xls)
- CSV (.csv, .txt)

### Navegando pelos Resultados

Após o processamento, você pode navegar pelos resultados usando as abas:

- **Dashboard**: Visão geral e estatísticas
- **Mudanças de Alocação**: Funcionários que mudaram de setor/departamento
- **Nomes Similares**: Possíveis correspondências que precisam de verificação manual
- **Funcionários Novos**: Presentes apenas na lista atual
- **Funcionários Removidos**: Presentes apenas na lista anterior
- **Relatório Completo**: Visão detalhada de todos os dados processados

### Exportando Relatórios

Clique no botão "Exportar Relatório" para salvar os resultados em:
- Excel (.xlsx) - Relatório completo com múltiplas abas
- CSV - Mudanças de alocação
- JSON - Dados completos em formato estruturado

### Configurações

Acesse as configurações (ícone de engrenagem) para:
- Ajustar o limiar de similaridade para correspondência de nomes
- Configurar manualmente as colunas de nome, empresa e alocação

## Manutenção e Atualização

### Atualizando os Dados

Para atualizar os dados:
1. Prepare os novos arquivos Excel ou CSV
2. Importe-os usando o botão "Importar Listas"
3. Processe a conciliação novamente

### Atualizando o Sistema

Para atualizar o sistema para uma nova versão:
1. Substitua os arquivos do código-fonte
2. Execute `npm install` para atualizar as dependências
3. Execute `npm run build` para gerar a nova versão de produção
4. Reimplante conforme as instruções acima

## Requisitos Técnicos

- Node.js 14.x ou superior
- NPM 6.x ou superior
- Navegador moderno (Chrome, Firefox, Edge, Safari)

## Suporte

Para questões técnicas ou suporte, entre em contato com o desenvolvedor.

---

© 2025 Sistema de Conciliação de Funcionários
