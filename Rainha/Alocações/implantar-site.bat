@echo off
echo ===================================================
echo Sistema de Conciliacao de Funcionarios - Implantacao
echo ===================================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js antes de executar este aplicativo.
    echo Visite: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Preparando ambiente para implantacao...

REM Verificar se as dependências estão instaladas
if not exist node_modules (
    echo Instalando dependencias necessarias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo Gerando build de producao...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao gerar build!
    pause
    exit /b 1
)

echo.
echo Build concluido com sucesso!
echo Os arquivos estaticos foram gerados na pasta 'out'
echo.
echo Para implantar o site:
echo 1. Copie o conteudo da pasta 'out' para seu servidor web
echo 2. Ou use a Vercel/Netlify conforme as instrucoes em IMPLANTACAO.md
echo.

pause
