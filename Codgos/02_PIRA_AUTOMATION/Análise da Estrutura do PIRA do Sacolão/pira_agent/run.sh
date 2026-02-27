#!/bin/bash

# Script para instalar dependências e executar o agente de IA para PIRAs

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python 3 não encontrado. Por favor, instale o Python 3 antes de continuar."
    exit 1
fi

# Remover ambiente virtual antigo se existir e tiver problemas
if [ -d "venv" ]; then
    echo "Removendo ambiente virtual antigo..."
    rm -rf venv
fi

# Criar ambiente virtual
echo "Criando ambiente virtual..."
python3 -m venv venv

# Verificar se o ambiente virtual foi criado corretamente
if [ ! -f "venv/bin/activate" ]; then
    echo "Falha ao criar ambiente virtual. Verifique se o pacote python3-venv está instalado."
    echo "Você pode instalá-lo com: sudo apt-get install python3-venv"
    exit 1
fi

# Ativar ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se o ambiente virtual foi ativado corretamente
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Falha ao ativar ambiente virtual."
    exit 1
fi

# Atualizar pip
echo "Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
echo "Instalando dependências..."
pip install -r requirements.txt

# Criar pasta uploads se não existir
mkdir -p uploads

# Executar a aplicação
echo "Iniciando o Agente de IA para PIRAs..."
python app.py
