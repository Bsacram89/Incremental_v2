@echo off
REM ============================================================================
REM Sistema Avançado de Conciliação de Funcionários - Executador Inteligente
REM Versão: 2.0.0
REM Autor: Sistema Automatizado
REM Data: %date%
REM ============================================================================

title Sistema de Conciliacao de Funcionarios - Executador Avancado

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                 SISTEMA AVANCADO DE CONCILIACAO DE FUNCIONARIOS              ║
echo ║                              Executador Inteligente                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

REM Configurar codificação para UTF-8
chcp 65001 >nul

REM Definir variáveis principais
set "PROJETO_DIR=%~dp0"
set "PRINCIPAL_APP=app-conciliacao-funcionarios.tsx"
set "HTML_INDEX=index.html"
set "BACKUP_DIR=%PROJETO_DIR%backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%"
set "LOG_FILE=%PROJETO_DIR%execucao.log"

echo [%time%] Iniciando sistema avançado de conciliação... >> "%LOG_FILE%"
echo 🚀 Iniciando Sistema Avançado de Conciliação de Funcionários...
echo.

REM Verificar se estamos no diretório correto
if not exist "%PROJETO_DIR%%PRINCIPAL_APP%" (
    echo ❌ ERRO: Arquivo principal não encontrado: %PRINCIPAL_APP%
    echo    Certifique-se de que o arquivo está no diretório: %PROJETO_DIR%
    echo [%time%] ERRO: Arquivo principal não encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo ✅ Arquivo principal encontrado: %PRINCIPAL_APP%
echo 📁 Diretório do projeto: %PROJETO_DIR%
echo.

REM Função para detectar Node.js
echo 🔍 Verificando ambiente de desenvolvimento...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js detectado
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    Versão: %NODE_VERSION%
    set "NODEJS_AVAILABLE=1"
) else (
    echo ⚠️  Node.js não encontrado - Usando modo HTML estático
    set "NODEJS_AVAILABLE=0"
)

REM Verificar npm
if "%NODEJS_AVAILABLE%"=="1" (
    npm --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ NPM detectado
        for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
        echo    Versão: %NPM_VERSION%
        set "NPM_AVAILABLE=1"
    ) else (
        echo ⚠️  NPM não encontrado
        set "NPM_AVAILABLE=0"
    )
)

echo.

REM Verificar se existe package.json
if exist "%PROJETO_DIR%package.json" (
    echo ✅ Projeto React/Node.js detectado (package.json encontrado)
    set "PROJECT_TYPE=REACT"
) else if exist "%PROJETO_DIR%%HTML_INDEX%" (
    echo ✅ Projeto HTML estático detectado
    set "PROJECT_TYPE=HTML"
) else (
    echo ℹ️  Tipo de projeto não identificado - Criando estrutura HTML
    set "PROJECT_TYPE=CREATE_HTML"
)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                              OPÇÕES DE EXECUÇÃO                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo Escolha como deseja executar o sistema:
echo.
echo [1] 🚀 Executar Aplicação React (Recomendado - Melhor Performance)
echo [2] 🌐 Executar via HTML Estático (Compatibilidade Máxima)
echo [3] 🔧 Configurar Ambiente de Desenvolvimento
echo [4] 📋 Criar Backup dos Dados
echo [5] 📊 Executar com Dados de Exemplo
echo [6] 🛠️  Diagnóstico Completo do Sistema
echo [7] ❓ Ajuda e Documentação
echo [0] ❌ Sair
echo.

:menu
set /p opcao="Digite sua opção (0-7): "

if "%opcao%"=="1" goto :react_mode
if "%opcao%"=="2" goto :html_mode
if "%opcao%"=="3" goto :setup_env
if "%opcao%"=="4" goto :backup_data
if "%opcao%"=="5" goto :exemplo_mode
if "%opcao%"=="6" goto :diagnostico
if "%opcao%"=="7" goto :ajuda
if "%opcao%"=="0" goto :sair

echo ❌ Opção inválida! Tente novamente.
goto :menu

:react_mode
echo.
echo 🚀 Executando em Modo React...
echo [%time%] Executando em modo React >> "%LOG_FILE%"

if "%NODEJS_AVAILABLE%"=="0" (
    echo ❌ Node.js necessário para modo React!
    echo    Instalando Node.js automaticamente...
    goto :install_nodejs
)

REM Verificar se existe package.json, se não, criar
if not exist "%PROJETO_DIR%package.json" (
    echo 📦 Criando package.json...
    call :create_package_json
)

REM Instalar dependências se necessário
if not exist "%PROJETO_DIR%node_modules" (
    echo 📥 Instalando dependências...
    cd /d "%PROJETO_DIR%"
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro na instalação das dependências
        goto :html_mode
    )
)

REM Executar aplicação React
echo 🎯 Iniciando servidor de desenvolvimento...
cd /d "%PROJETO_DIR%"
echo    Abrindo em http://localhost:3000
echo    Use Ctrl+C para parar o servidor
start "" "http://localhost:3000"
npm start
goto :fim

:html_mode
echo.
echo 🌐 Executando em Modo HTML Estático...
echo [%time%] Executando em modo HTML >> "%LOG_FILE%"

REM Criar arquivo HTML se não existir
if not exist "%PROJETO_DIR%%HTML_INDEX%" (
    echo 📄 Criando arquivo HTML...
    call :create_html_file
)

REM Verificar se Python está disponível para servidor local
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python detectado - Iniciando servidor local...
    cd /d "%PROJETO_DIR%"
    echo    Abrindo em http://localhost:8000
    start "" "http://localhost:8000"
    python -m http.server 8000
) else (
    REM Tentar Node.js como servidor estático
    if "%NODEJS_AVAILABLE%"=="1" (
        echo ✅ Usando Node.js como servidor estático...
        cd /d "%PROJETO_DIR%"
        echo    Abrindo em http://localhost:8080
        start "" "http://localhost:8080"
        npx http-server -p 8080
    ) else (
        echo 📂 Abrindo arquivo diretamente no navegador...
        start "" "%PROJETO_DIR%%HTML_INDEX%"
    )
)
goto :fim

:setup_env
echo.
echo 🔧 Configurando Ambiente de Desenvolvimento...
echo [%time%] Configurando ambiente >> "%LOG_FILE%"

echo Verificando e instalando dependências necessárias...

REM Verificar se Chocolatey está instalado
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
)

:install_nodejs
if "%NODEJS_AVAILABLE%"=="0" (
    echo 📥 Instalando Node.js...
    choco install nodejs -y
    echo ✅ Node.js instalado! Reinicie o script.
    pause
    goto :fim
)

echo ✅ Ambiente configurado com sucesso!
pause
goto :menu

:backup_data
echo.
echo 📋 Criando Backup dos Dados...
echo [%time%] Criando backup >> "%LOG_FILE%"

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Copiando arquivos...
copy "%PROJETO_DIR%*.tsx" "%BACKUP_DIR%\" >nul 2>&1
copy "%PROJETO_DIR%*.js" "%BACKUP_DIR%\" >nul 2>&1
copy "%PROJETO_DIR%*.json" "%BACKUP_DIR%\" >nul 2>&1
copy "%PROJETO_DIR%*.html" "%BACKUP_DIR%\" >nul 2>&1
copy "%PROJETO_DIR%*.css" "%BACKUP_DIR%\" >nul 2>&1
copy "%PROJETO_DIR%*.xlsx" "%BACKUP_DIR%\" >nul 2>&1
copy "%PROJETO_DIR%*.md" "%BACKUP_DIR%\" >nul 2>&1

echo ✅ Backup criado em: %BACKUP_DIR%
echo [%time%] Backup criado com sucesso >> "%LOG_FILE%"
pause
goto :menu

:exemplo_mode
echo.
echo 📊 Executando com Dados de Exemplo...
echo [%time%] Executando com dados de exemplo >> "%LOG_FILE%"

REM Verificar se dados de exemplo existem
if exist "%PROJETO_DIR%dados_teste_lista1.xlsx" (
    echo ✅ Dados de exemplo encontrados
) else (
    echo 📝 Criando dados de exemplo...
    call :create_sample_data
)

echo 🎯 Redirecionando para execução principal...
goto :html_mode

:diagnostico
echo.
echo 🛠️  Executando Diagnóstico Completo...
echo [%time%] Executando diagnóstico >> "%LOG_FILE%"
echo.

echo ═══ DIAGNÓSTICO DO SISTEMA ═══
echo Data/Hora: %date% %time%
echo Diretório: %PROJETO_DIR%
echo.

echo ═══ ARQUIVOS DO PROJETO ═══
dir "%PROJETO_DIR%" /b

echo.
echo ═══ AMBIENTE DE DESENVOLVIMENTO ═══
echo Node.js: %NODE_VERSION%
if "%NPM_AVAILABLE%"=="1" echo NPM: %NPM_VERSION%

echo.
echo ═══ VERIFICAÇÃO DE INTEGRIDADE ═══
if exist "%PROJETO_DIR%%PRINCIPAL_APP%" (
    echo ✅ Arquivo principal encontrado
) else (
    echo ❌ Arquivo principal AUSENTE
)

if exist "%PROJETO_DIR%reconciliationEngine.js" (
    echo ✅ Engine de conciliação encontrado
) else (
    echo ❌ Engine de conciliação AUSENTE
)

if exist "%PROJETO_DIR%stringUtils.js" (
    echo ✅ Utilitários de string encontrados
) else (
    echo ❌ Utilitários de string AUSENTES
)

echo.
echo ═══ RECOMENDAÇÕES ═══
if "%NODEJS_AVAILABLE%"=="1" (
    echo ✅ Recomendo usar Modo React para melhor performance
) else (
    echo ⚠️  Instale Node.js para funcionalidades avançadas
)

echo.
pause
goto :menu

:ajuda
echo.
echo ❓ Ajuda e Documentação
echo.
echo ═══ SOBRE O SISTEMA ═══
echo Este é um sistema avançado de conciliação de funcionários que utiliza
echo algoritmos de similaridade para comparar listas e identificar diferenças.
echo.
echo ═══ CARACTERÍSTICAS PRINCIPAIS ═══
echo • Algoritmos Jaro-Winkler e Levenshtein
echo • Detecção inteligente de padronizações
echo • Interface React moderna
echo • Suporte a CSV e Excel
echo • Relatórios detalhados
echo • Configuração flexível
echo.
echo ═══ REQUISITOS ═══
echo • Windows 10/11
echo • Node.js 16+ (recomendado)
echo • Navegador moderno
echo • Arquivos CSV com colunas Nome,Alocacao
echo.
echo ═══ SUPORTE ═══
echo Para suporte técnico, consulte os arquivos:
echo • analise_problemas.md
echo • todo.md
echo • Logs em: execucao.log
echo.
pause
goto :menu

:create_package_json
echo {> "%PROJETO_DIR%package.json"
echo   "name": "sistema-conciliacao-funcionarios",>> "%PROJETO_DIR%package.json"
echo   "version": "2.0.0",>> "%PROJETO_DIR%package.json"
echo   "private": true,>> "%PROJETO_DIR%package.json"
echo   "dependencies": {>> "%PROJETO_DIR%package.json"
echo     "react": "^18.2.0",>> "%PROJETO_DIR%package.json"
echo     "react-dom": "^18.2.0",>> "%PROJETO_DIR%package.json"
echo     "react-scripts": "5.0.1",>> "%PROJETO_DIR%package.json"
echo     "lucide-react": "^0.263.1">> "%PROJETO_DIR%package.json"
echo   },>> "%PROJETO_DIR%package.json"
echo   "scripts": {>> "%PROJETO_DIR%package.json"
echo     "start": "react-scripts start",>> "%PROJETO_DIR%package.json"
echo     "build": "react-scripts build",>> "%PROJETO_DIR%package.json"
echo     "test": "react-scripts test",>> "%PROJETO_DIR%package.json"
echo     "eject": "react-scripts eject">> "%PROJETO_DIR%package.json"
echo   },>> "%PROJETO_DIR%package.json"
echo   "eslintConfig": {>> "%PROJETO_DIR%package.json"
echo     "extends": [>> "%PROJETO_DIR%package.json"
echo       "react-app",>> "%PROJETO_DIR%package.json"
echo       "react-app/jest">> "%PROJETO_DIR%package.json"
echo     ]>> "%PROJETO_DIR%package.json"
echo   },>> "%PROJETO_DIR%package.json"
echo   "browserslist": {>> "%PROJETO_DIR%package.json"
echo     "production": [>> "%PROJETO_DIR%package.json"
echo       "^0.2%%",>> "%PROJETO_DIR%package.json"
echo       "not dead",>> "%PROJETO_DIR%package.json"
echo       "not op_mini all">> "%PROJETO_DIR%package.json"
echo     ],>> "%PROJETO_DIR%package.json"
echo     "development": [>> "%PROJETO_DIR%package.json"
echo       "last 1 chrome version",>> "%PROJETO_DIR%package.json"
echo       "last 1 firefox version",>> "%PROJETO_DIR%package.json"
echo       "last 1 safari version">> "%PROJETO_DIR%package.json"
echo     ]>> "%PROJETO_DIR%package.json"
echo   }>> "%PROJETO_DIR%package.json"
echo }>> "%PROJETO_DIR%package.json"
exit /b

:create_html_file
echo ^<!doctype html^>> "%PROJETO_DIR%%HTML_INDEX%"
echo ^<html lang="pt-BR"^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo   ^<head^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<meta charset="UTF-8" /^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<title^>Sistema Avançado de Conciliação de Funcionários^</title^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<script src="https://unpkg.com/react@18/umd/react.development.js"^>^</script^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"^>^</script^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<script src="https://unpkg.com/@babel/standalone/babel.min.js"^>^</script^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<script src="https://cdn.tailwindcss.com"^>^</script^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo   ^</head^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo   ^<body^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<div id="root"^>^</div^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo     ^<script type="text/babel" src="app-conciliacao-funcionarios.tsx"^>^</script^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo   ^</body^>>> "%PROJETO_DIR%%HTML_INDEX%"
echo ^</html^>>> "%PROJETO_DIR%%HTML_INDEX%"
exit /b

:create_sample_data
echo Nome,Alocacao> "%PROJETO_DIR%dados_teste_lista1.csv"
echo ADRIANA CLEIDE ALVES,ESCRITORIO>> "%PROJETO_DIR%dados_teste_lista1.csv"
echo CAROLINE BERNARDO DA SILVA,GENESIS>> "%PROJETO_DIR%dados_teste_lista1.csv"
echo MICHELLE JESUS ROCHA,REIS MTZ>> "%PROJETO_DIR%dados_teste_lista1.csv"
echo VALERIA BATISTA DOS SANTOS - 26/09,30K>> "%PROJETO_DIR%dados_teste_lista1.csv"

echo Nome,Alocacao> "%PROJETO_DIR%dados_teste_lista2.csv"
echo ADRIANA CLEIDE ALVES FIGUEREDO SANTOS,ESCRITORIO>> "%PROJETO_DIR%dados_teste_lista2.csv"
echo CAROLINE BERNARDO SILVA,GENESIS>> "%PROJETO_DIR%dados_teste_lista2.csv"
echo MICHELLE JESUS ROCHA ESTRELA,GENESIS>> "%PROJETO_DIR%dados_teste_lista2.csv"
echo VALERIA BATISTA DOS SANTOS,30K>> "%PROJETO_DIR%dados_teste_lista2.csv"
echo NOVO FUNCIONARIO,RAINHA MAISON>> "%PROJETO_DIR%dados_teste_lista2.csv"
exit /b

:sair
echo.
echo 👋 Encerrando Sistema de Conciliação...
echo [%time%] Sistema encerrado pelo usuário >> "%LOG_FILE%"
echo.
echo Obrigado por usar o Sistema Avançado de Conciliação de Funcionários!
echo.
timeout 3 >nul
exit

:fim
echo.
echo [%time%] Execução finalizada >> "%LOG_FILE%"
echo ✅ Execução finalizada. Pressione qualquer tecla para continuar...
pause >nul
goto :menu
