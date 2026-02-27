#!/usr/bin/env python
"""
Script para executar o notebook Jupyter e gerar versão executada
"""

import subprocess
import sys
import os
import json

def execute_notebook():
    try:
        # Caminho do notebook
        notebook_path = "notebook_awamW_temp.ipynb"
        output_path = "notebook_awamW_EXECUTADO.ipynb"
        
        print(f"Executando notebook: {notebook_path}")
        print(f"Saída será salva em: {output_path}")
        
        # Comando para executar o notebook
        cmd = [
            sys.executable, "-m", "nbconvert",
            "--to", "notebook",
            "--execute",
            notebook_path,
            "--output", output_path,
            "--allow-errors"
        ]
        
        print(f"Comando: {' '.join(cmd)}")
        
        # Executar o comando
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        
        print(f"Código de retorno: {result.returncode}")
        
        if result.stdout:
            print(f"STDOUT:\n{result.stdout}")
        
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        
        if result.returncode == 0:
            print("✅ Notebook executado com sucesso!")
            
            # Verificar se o arquivo foi criado
            if os.path.exists(output_path):
                print(f"✅ Arquivo de saída criado: {output_path}")
                return True
            else:
                print("❌ Arquivo de saída não foi encontrado")
                return False
        else:
            print("❌ Erro na execução do notebook")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

if __name__ == "__main__":
    success = execute_notebook()
    sys.exit(0 if success else 1)
