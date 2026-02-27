@echo off
title Sistema de Conciliacao - Executador Simples
chcp 65001 >nul

echo.
echo ================================
echo  Sistema de Conciliacao 
echo  Executador Funcional
echo ================================
echo.

REM Definir diretorio
set "DIR=%~dp0"
cd /d "%DIR%"

REM Verificar arquivo principal
if not exist "index.html" (
    echo Criando arquivo HTML...
    call :criar_html
)

echo Opcoes de execucao:
echo.
echo [1] Executar com Python (Recomendado)
echo [2] Executar com Node.js  
echo [3] Abrir direto no navegador
echo [4] Sair
echo.

:menu
set /p opcao="Digite sua opcao (1-4): "

if "%opcao%"=="1" goto :python
if "%opcao%"=="2" goto :nodejs  
if "%opcao%"=="3" goto :browser
if "%opcao%"=="4" goto :sair

echo Opcao invalida!
goto :menu

:python
echo Iniciando com Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python nao encontrado! Tentando Node.js...
    goto :nodejs
)
echo Abrindo http://localhost:8000
start "" "http://localhost:8000"
python -m http.server 8000
goto :fim

:nodejs
echo Iniciando com Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado! Abrindo no navegador...
    goto :browser
)
echo Abrindo http://localhost:3000
start "" "http://localhost:3000" 
npx http-server -p 3000
goto :fim

:browser
echo Abrindo no navegador...
start "" "index.html"
goto :fim

:criar_html
echo ^<!DOCTYPE html^> > index.html
echo ^<html lang="pt-BR"^> >> index.html
echo ^<head^> >> index.html
echo     ^<meta charset="UTF-8"^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> index.html
echo     ^<title^>Sistema de Conciliacao^</title^> >> index.html
echo     ^<script src="https://unpkg.com/react@18/umd/react.development.js"^>^</script^> >> index.html
echo     ^<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"^>^</script^> >> index.html
echo     ^<script src="https://unpkg.com/@babel/standalone/babel.min.js"^>^</script^> >> index.html
echo     ^<script src="https://cdn.tailwindcss.com"^>^</script^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo     ^<div id="root"^>^</div^> >> index.html
echo     ^<script type="text/babel" src="conciliacao.js"^>^</script^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html
exit /b

:sair
echo Saindo...
exit

:fim
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
goto :menu
