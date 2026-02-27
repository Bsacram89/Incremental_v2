"""
Módulo de interface web para o Agente de IA de PIRAs.
Fornece uma interface simples para upload e processamento de arquivos PIRA.
"""

import os
import logging
from datetime import datetime
from flask import Flask, request, render_template, redirect, url_for, flash, send_file
from werkzeug.utils import secure_filename
from core.processor import PIRAProcessor, configure_logger

# Configurar logger
logger = configure_logger()

# Configurar aplicação Flask
app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# Criar pasta de uploads se não existir
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Extensões permitidas
ALLOWED_EXTENSIONS = {'xlsx', 'xlsm'}

def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Página inicial."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Processa o upload e processamento de um arquivo PIRA."""
    # Verificar se há arquivo no request
    if 'file' not in request.files:
        flash('Nenhum arquivo selecionado')
        return redirect(request.url)
    
    file = request.files['file']
    
    # Verificar se o usuário selecionou um arquivo
    if file.filename == '':
        flash('Nenhum arquivo selecionado')
        return redirect(request.url)
    
    # Verificar se o arquivo tem uma extensão permitida
    if not allowed_file(file.filename):
        flash('Tipo de arquivo não permitido. Use .xlsx ou .xlsm')
        return redirect(request.url)
    
    # Salvar o arquivo
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    saved_filename = f"{timestamp}_{filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], saved_filename)
    file.save(filepath)
    
    # Obter tipo de cliente (opcional)
    client_type = request.form.get('client_type', None)
    
    # Processar o arquivo
    try:
        processor = PIRAProcessor(client_type)
        result = processor.process(filepath)
        
        if result:
            flash('Arquivo processado com sucesso!')
            # Retornar o arquivo processado para download
            return send_file(filepath, as_attachment=True, download_name=filename)
        else:
            flash('Erro ao processar o arquivo. Verifique os logs para mais detalhes.')
            return redirect(url_for('index'))
    except Exception as e:
        logger.error(f"Erro ao processar arquivo: {str(e)}")
        flash(f'Erro ao processar o arquivo: {str(e)}')
        return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
