import os
import sys
from datetime import datetime
import logging
from core.processor import PIRAProcessor, configure_logger

def main():
    """
    Função principal para processar um arquivo PIRA.
    
    Uso:
        python main.py <caminho_do_arquivo_pira> [tipo_cliente]
    
    Args:
        caminho_do_arquivo_pira: Caminho completo para o arquivo PIRA a ser processado
        tipo_cliente (opcional): Tipo de cliente (ex: 'jaguare', 'sacolao'). 
                                Se não especificado, será detectado automaticamente.
    """
    # Configurar logger
    logger = configure_logger()
    
    # Verificar argumentos
    if len(sys.argv) < 2:
        logger.error("Uso: python main.py <caminho_do_arquivo_pira> [tipo_cliente]")
        return 1
    
    # Obter caminho do arquivo
    file_path = sys.argv[1]
    
    # Verificar se o arquivo existe
    if not os.path.exists(file_path):
        logger.error(f"Arquivo não encontrado: {file_path}")
        return 1
    
    # Obter tipo de cliente (opcional)
    client_type = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Criar processador
    processor = PIRAProcessor(client_type)
    
    # Processar arquivo
    logger.info(f"Iniciando processamento do arquivo: {file_path}")
    result = processor.process(file_path)
    
    if result:
        logger.info("Processamento concluído com sucesso!")
        return 0
    else:
        logger.error("Falha no processamento.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
