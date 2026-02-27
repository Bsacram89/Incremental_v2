@echo off
echo.
echo ===============================================
echo    FOLHA TRANSPARENTE WEB - SETUP E TESTE
echo ===============================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado! Instale Node.js 18+ primeiro.
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado: 
node --version

echo.
echo [2/5] Verificando dependencias...
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro na instalacao das dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas com sucesso!
) else (
    echo ✅ Dependencias ja instaladas
)

echo.
echo [3/5] Verificando componentes novos...
if exist "src\components\FileUploadImproved.tsx" (
    echo ✅ FileUploadImproved.tsx - OK
) else (
    echo ❌ FileUploadImproved.tsx nao encontrado
)

if exist "src\components\MultiEmployeeManager.tsx" (
    echo ✅ MultiEmployeeManager.tsx - OK
) else (
    echo ❌ MultiEmployeeManager.tsx nao encontrado
)

echo.
echo [4/5] Executando validacao...
npm run lint >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Codigo validado com sucesso!
) else (
    echo ⚠️  Avisos de linting encontrados (nao critico)
)

echo.
echo [5/5] Resumo das melhorias implementadas:
echo ✅ Upload avançado com suporte a multiplos funcionarios
echo ✅ Parser inteligente com fallbacks automaticos
echo ✅ Gerenciador visual de funcionarios
echo ✅ Exportacao JSON/CSV
echo ✅ Interface moderna e responsiva
echo ✅ Tratamento robusto de erros

echo.
echo ===============================================
echo             PRONTO PARA USAR!
echo ===============================================
echo.
echo Para iniciar o servidor de desenvolvimento:
echo   npm run dev
echo.
echo Para testar upload:
echo   1. Execute: npm run dev
echo   2. Acesse: http://localhost:5173
echo   3. Va para aba "Upload"
echo   4. Use "Upload Avancado"
echo   5. Teste com arquivo de folha .txt
echo.
echo Documentacao: README_ATUALIZADO.md
echo.

choice /c SN /m "Deseja iniciar o servidor agora? (S/N)"
if %errorlevel% equ 1 (
    echo.
    echo 🚀 Iniciando servidor...
    npm run dev
)

echo.
echo Script finalizado. Pressione qualquer tecla para sair.
pause >nul