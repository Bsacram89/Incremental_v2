@echo off
echo ===================================================
echo Sistema de Conciliacao de Funcionarios - Iniciando
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

REM Verificar se o npm está instalado
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: npm nao encontrado!
    echo Por favor, instale o npm antes de executar este aplicativo.
    echo.
    pause
    exit /b 1
)

echo Verificando dependencias...

REM Verificar se a pasta node_modules existe
if not exist node_modules (
    echo Instalando dependencias necessarias...
    npm install react react-dom next xlsx lucide-react tailwindcss postcss autoprefixer
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo Iniciando o servidor de desenvolvimento...
echo.
echo O aplicativo sera aberto automaticamente no seu navegador padrao.
echo Se nao abrir automaticamente, acesse: http://localhost:3000
echo.
echo Para encerrar o aplicativo, pressione Ctrl+C nesta janela.
echo.

REM Iniciar o servidor Next.js
npx next dev

pause
