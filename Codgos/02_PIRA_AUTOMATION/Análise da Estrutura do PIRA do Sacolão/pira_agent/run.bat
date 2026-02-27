@echo off

echo Verificando Python...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Python nao encontrado no PATH. Por favor, instale o Python 3.10+ e adicione ao PATH.
    pause
    exit /b 1
)

echo Configurando ambiente virtual...

REM Cria o ambiente virtual se nao existir
if not exist venv\Scripts\activate (
    echo Criando ambiente virtual...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Falha ao criar ambiente virtual.
        pause
        exit /b 1
    )
)

echo Ativando ambiente virtual...
call .\venv\Scripts\activate

echo Atualizando pip e instalando dependencias...
pip install --upgrade pip
pip install -r requirements.txt

echo Iniciando o Agente de IA para PIRAs...
python app.py

echo.
echo O servidor esta rodando. Acesse http://localhost:5000 no seu navegador.
echo Pressione Ctrl+C nesta janela para parar o servidor.
pause > nul
