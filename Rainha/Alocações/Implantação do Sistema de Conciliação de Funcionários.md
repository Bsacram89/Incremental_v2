# Implantação do Sistema de Conciliação de Funcionários

Este arquivo contém instruções para implantar o Sistema de Conciliação de Funcionários como um site permanente.

## Arquivos do Projeto

- `app-conciliacao-funcionarios-melhorado.tsx`: Componente principal com todas as melhorias implementadas
- `iniciar-conciliacao.bat`: Script para execução rápida em ambiente Windows
- `pages/`: Diretório com arquivos Next.js para a aplicação web
- `components/`: Componentes React utilizados na aplicação
- `styles/`: Estilos CSS e configuração do Tailwind
- `public/`: Arquivos estáticos (imagens, favicon, etc.)
- `package.json`: Dependências e scripts do projeto
- `next.config.js`: Configuração do Next.js para exportação estática
- `tailwind.config.js` e `postcss.config.js`: Configuração do Tailwind CSS

## Passos para Implantação

### 1. Implantação no Vercel (Recomendado)

A Vercel é a plataforma mais simples para hospedar aplicações Next.js:

1. Crie uma conta em [vercel.com](https://vercel.com/)
2. Instale o Vercel CLI: `npm i -g vercel`
3. No diretório do projeto, execute: `vercel login`
4. Para implantar, execute: `vercel`
5. Siga as instruções na tela
6. Após a implantação, você receberá uma URL permanente

### 2. Implantação no Netlify

Outra opção excelente para hospedagem:

1. Crie uma conta em [netlify.com](https://www.netlify.com/)
2. Execute `npm run build` para gerar a versão de produção
3. Arraste e solte a pasta `out` gerada para o painel do Netlify
4. Ou conecte seu repositório Git para implantação contínua

### 3. Implantação no GitHub Pages

Para hospedar gratuitamente via GitHub:

1. Crie um repositório no GitHub
2. Configure o arquivo `next.config.js` com o caminho base correto
3. Execute `npm run build`
4. Envie a pasta `out` para o branch `gh-pages`
5. Configure o GitHub Pages nas configurações do repositório

## Manutenção e Atualização

### Atualizando os Dados

Para atualizar os dados processados:
1. Acesse o sistema implantado
2. Use o botão "Importar Listas" para carregar novos arquivos
3. Processe a conciliação novamente

### Atualizando o Sistema

Para atualizar o código do sistema:
1. Modifique os arquivos necessários
2. Execute `npm run build` para gerar a nova versão
3. Reimplante seguindo os passos acima

## Suporte Técnico

Para questões técnicas ou problemas de implantação, consulte a documentação completa no arquivo README.md ou entre em contato com o desenvolvedor.
