"""
Módulo de processamento de PIRAs.
Contém as classes principais para processamento de arquivos PIRA.
"""

import os
import json
import logging
from datetime import datetime
import re
import xlwings as xw

class StructureDetector:
    """
    Classe responsável por detectar a estrutura de um arquivo PIRA
    e identificar o tipo de cliente.
    """
    
    def __init__(self):
        self.logger = logging.getLogger("PIRAAgent.StructureDetector")
        
    def detect_client(self, file_path):
        """
        Detecta o tipo de cliente com base na estrutura do arquivo PIRA.
        
        Args:
            file_path (str): Caminho para o arquivo PIRA
            
        Returns:
            str: Tipo de cliente detectado (ex: 'jaguare', 'sacolao', etc.)
        """
        self.logger.info(f"Detectando tipo de cliente para o arquivo: {file_path}")
        
        try:
            # Abrir o arquivo Excel
            app = xw.App(visible=False)
            try:
                wb = app.books.open(file_path)
                
                # Obter nomes de todas as abas
                sheet_names = [sheet.name for sheet in wb.sheets]
                self.logger.info(f"Abas encontradas: {sheet_names}")
                
                # Verificar padrões específicos para cada cliente
                if self._is_jaguare(sheet_names):
                    return "jaguare"
                elif self._is_sacolao(sheet_names):
                    return "sacolao"
                elif self._is_estacao_santa(sheet_names):
                    return "estacao_santa"
                elif self._is_rainha(sheet_names):
                    return "rainha"
                elif self._is_padaria_real(sheet_names):
                    return "padaria_real"
                else:
                    self.logger.warning("Tipo de cliente não identificado. Usando 'generico'.")
                    return "generico"
                
            finally:
                # Fechar Excel sem salvar
                if 'wb' in locals():
                    wb.close()
                app.quit()
                
        except Exception as e:
            self.logger.error(f"Erro ao detectar cliente: {str(e)}")
            return "desconhecido"
    
    def _is_jaguare(self, sheet_names):
        """Verifica se o PIRA é do cliente Jaguaré."""
        # Verificar abas específicas do Jaguaré
        return "R2_Análise de Resul. Acum." in sheet_names
    
    def _is_sacolao(self, sheet_names):
        """Verifica se o PIRA é do cliente Sacolão da Santa."""
        # Verificar abas específicas do Sacolão
        return "R2_Análise Resul Acumulado" in sheet_names
    
    def _is_estacao_santa(self, sheet_names):
        """Verifica se o PIRA é do cliente Estação da Santa."""
        # Verificar a presença da aba específica da Estação da Santa
        return " E7_Fat Estação da Santa" in sheet_names or "E7_Fat Estação da Santa" in sheet_names
    
    def _is_rainha(self, sheet_names):
        """Verifica se o PIRA é do cliente Lojas Rainha."""
        # Placeholder: Verificar abas específicas da Lojas Rainha
        # Exemplo: return "AbaEspecificaRainha" in sheet_names
        return False  # Atualizar com lógica real
    
    def _is_padaria_real(self, sheet_names):
        """Verifica se o PIRA é do cliente Padaria Real."""
        # Placeholder: Verificar abas específicas da Padaria Real
        # Exemplo: return "AbaEspecificaPadariaReal" in sheet_names
        return False  # Atualizar com lógica real


class RulesEngine:
    """
    Motor de regras para processamento de PIRAs.
    Carrega e interpreta regras definidas em formato JSON.
    """
    
    def __init__(self):
        self.logger = logging.getLogger("PIRAAgent.RulesEngine")
        self.rules_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rules")
        self.operations = {}
        self._register_operations()
        
    def _register_operations(self):
        """Registra as operações disponíveis para o motor de regras."""
        # Operações básicas
        self.operations["clear_range"] = self._op_clear_range
        self.operations["copy_range"] = self._op_copy_range
        self.operations["process_r2_analise"] = self._op_process_r2_analise
        self.operations["clear_range_except"] = self._op_clear_range_except
        self.operations["update_inf_gerais"] = self._op_update_inf_gerais
        # Adicionar mais operações conforme necessário
        
    def load_client_rules(self, client_type):
        """
        Carrega as regras específicas para um tipo de cliente.
        
        Args:
            client_type (str): Tipo de cliente (ex: 'jaguare', 'sacolao', etc.)
            
        Returns:
            dict: Regras carregadas do arquivo JSON
        """
        self.logger.info(f"Carregando regras para o cliente: {client_type}")
        
        # Caminho para o arquivo de regras
        rules_file = os.path.join(self.rules_dir, f"{client_type}.json")
        
        # Verificar se o arquivo existe
        if not os.path.exists(rules_file):
            self.logger.warning(f"Arquivo de regras não encontrado: {rules_file}")
            return {}
        
        # Carregar regras do arquivo JSON
        try:
            with open(rules_file, 'r', encoding='utf-8') as f:
                rules = json.load(f)
            self.logger.info(f"Regras carregadas com sucesso: {len(rules.get('rules', []))} regras")
            return rules
        except Exception as e:
            self.logger.error(f"Erro ao carregar regras: {str(e)}")
            return {}
    
    def execute_rules(self, workbook, rules):
        """
        Executa as regras em um workbook Excel.
        
        Args:
            workbook: Objeto workbook do xlwings
            rules (dict): Regras a serem executadas
            
        Returns:
            bool: True se as regras foram executadas com sucesso, False caso contrário
        """
        self.logger.info("Iniciando execução de regras")
        
        # Verificar se há regras para executar
        if not rules or "rules" not in rules:
            self.logger.warning("Nenhuma regra para executar")
            return False
        
        # Executar cada regra
        for rule in rules["rules"]:
            sheet_name = rule.get("sheet")
            operations = rule.get("operations", [])
            
            # Verificar se a aba existe
            if sheet_name not in [sheet.name for sheet in workbook.sheets]:
                self.logger.warning(f"Aba não encontrada: {sheet_name}")
                continue
            
            # Obter a aba
            sheet = workbook.sheets[sheet_name]
            self.logger.info(f"Processando aba: {sheet_name}")
            
            # Executar operações
            for operation in operations:
                op_type = operation.get("type")
                params = operation.get("params", {})
                
                if op_type in self.operations:
                    try:
                        self.logger.info(f"Executando operação: {op_type}")
                        self.operations[op_type](sheet, params)
                    except Exception as e:
                        self.logger.error(f"Erro ao executar operação {op_type}: {str(e)}")
                else:
                    self.logger.warning(f"Operação não reconhecida: {op_type}")
        
        self.logger.info("Execução de regras concluída")
        return True
    
    # Implementações das operações
    def _op_clear_range(self, sheet, params):
        """Limpa o conteúdo de um intervalo de células."""
        range_str = params.get("range")
        if not range_str:
            self.logger.warning("Parâmetro 'range' não especificado para clear_range")
            return
        
        try:
            sheet.range(range_str).clear_contents()
            self.logger.info(f"Intervalo limpo: {range_str}")
        except Exception as e:
            self.logger.error(f"Erro ao limpar intervalo {range_str}: {str(e)}")
    
    def _op_copy_range(self, sheet, params):
        """Copia valores de um intervalo para outro."""
        source = params.get("source")
        destination = params.get("destination")
        
        if not source or not destination:
            self.logger.warning("Parâmetros 'source' ou 'destination' não especificados para copy_range")
            return
        
        try:
            # Copiar valores
            sheet.range(source).copy()
            sheet.range(destination).paste(paste="values_and_number_formats")
            self.logger.info(f"Valores copiados de {source} para {destination}")
            
            # Limpar origem se especificado
            if params.get("clear_source", False):
                sheet.range(source).clear_contents()
                self.logger.info(f"Origem limpa: {source}")
        except Exception as e:
            self.logger.error(f"Erro ao copiar de {source} para {destination}: {str(e)}")
    
    def _op_clear_range_except(self, sheet, params):
        """Limpa o conteúdo de um intervalo de células, exceto células específicas."""
        range_str = params.get("range")
        exceptions = params.get("exceptions", [])
        
        if not range_str:
            self.logger.warning("Parâmetro 'range' não especificado para clear_range_except")
            return
        
        try:
            # Salvar valores das células de exceção
            exception_values = {}
            for cell in exceptions:
                exception_values[cell] = sheet.range(cell).value
                self.logger.info(f"Valor salvo para célula de exceção {cell}: {exception_values[cell]}")
            
            # Limpar o intervalo completo
            sheet.range(range_str).clear_contents()
            self.logger.info(f"Intervalo limpo: {range_str}")
            
            # Restaurar valores das células de exceção
            for cell, value in exception_values.items():
                sheet.range(cell).value = value
                self.logger.info(f"Valor restaurado para célula {cell}: {value}")
                
        except Exception as e:
            self.logger.error(f"Erro ao limpar intervalo {range_str} com exceções: {str(e)}")
    
    def _op_update_inf_gerais(self, sheet, params):
        """
        Atualiza informações gerais na aba E16_Inf.Gerais ou E8_Informações Gerais.
        Atualiza a data e outras informações relevantes.
        """
        self.logger.info(f"Atualizando informações gerais na aba: {sheet.name}")
        
        try:
            # Obter mês e ano atual
            current_date = datetime.now()
            current_month = current_date.month
            current_year = current_date.year
            
            # Verificar se há parâmetros específicos
            month = params.get("month", current_month)
            year = params.get("year", current_year)
            
            # Atualizar células específicas com a data
            # Nota: As células exatas podem variar dependendo do cliente
            try:
                # Tentar encontrar e atualizar células de data
                for row in range(1, 20):  # Procurar nas primeiras 20 linhas
                    for col in range(1, 10):  # Procurar nas primeiras 10 colunas
                        cell_value = sheet.range((row, col)).value
                        if isinstance(cell_value, str) and "data" in cell_value.lower():
                            # Encontrou uma célula que parece conter uma data
                            # Atualizar a célula ao lado ou abaixo
                            sheet.range((row, col+1)).value = f"{month}/{year}"
                            self.logger.info(f"Data atualizada na célula ({row}, {col+1}): {month}/{year}")
                            break
            except Exception as e:
                self.logger.warning(f"Erro ao atualizar células de data: {str(e)}")
            
            self.logger.info(f"Atualização de informações gerais concluída")
            
        except Exception as e:
            self.logger.error(f"Erro ao atualizar informações gerais: {str(e)}")
    def _op_process_r2_analise(self, sheet, params):
        """
        Processa a aba R2_Análise Resul Acumulado e similares.
        1. Localiza a célula com referência ao valor de EO2 ou similar
        2. Insere duas colunas após essa célula
        3. Copia os dados das colunas seguintes para as novas colunas
        """
        try:
            used_range = sheet.used_range
            last_col = min(200, used_range.last_cell.column)  # Limitar a 200 colunas
            last_row = min(100, used_range.last_cell.row)     # Limitar a 100 linhas
            
            # Variáveis para armazenar a posição encontrada
            ref_encontrada = False
            found_col = 0
            found_row = 0
            
            # Procurar em todas as células por uma referência do tipo =ALGUMACOISA$2
            for row in range(1, last_row + 1):
                for col in range(1, last_col + 1):
                    try:
                        # Converter índice de coluna para letra
                        col_letter = self._get_column_letter(col)
                            
                        cell_addr = f"{col_letter}{row}"
                        formula = str(sheet.range(cell_addr).formula)
                        
                        # Verificar se a célula contém um padrão de referência a qualquer coluna $2
                        if re.search(r'=\$?[A-Z]+\$?2', formula):
                            self.logger.info(f"Referência a coluna$2 encontrada na célula {cell_addr}: {formula}")
                            
                            ref_encontrada = True
                            found_col = col
                            found_row = row
                            break
                    except Exception as e:
                        self.logger.warning(f"Erro ao verificar célula {self._get_column_letter(col)}{row}: {str(e)}")
                
                if ref_encontrada:
                    break
            
            if not ref_encontrada:
                self.logger.error(f"Não foi possível encontrar referência adequada para inserção. Abortando.")
                return
            
            # Verificar se a célula está mesclada antes de tentar inserir
            try:
                merged_ranges = sheet.api.MergedCells
                
                # Função para verificar se uma célula está em algum intervalo mesclado
                def is_cell_merged(row, col):
                    for merged_range in merged_ranges:
                        if merged_range.Column <= col <= (merged_range.Column + merged_range.Width - 1) and \
                           merged_range.Row <= row <= (merged_range.Row + merged_range.Height - 1):
                            return True
                    return False
                
                # Se a célula estiver mesclada, desmerge antes
                if is_cell_merged(found_row, found_col):
                    self.logger.info(f"Célula na posição {found_col},{found_row} está mesclada. Desmergindo...")
                    # Encontrar qual intervalo contém esta célula e desmergir
                    for i in range(1, merged_ranges.Count + 1):
                        merged_range = merged_ranges.Item(i)
                        if merged_range.Column <= found_col <= (merged_range.Column + merged_range.Width - 1) and \
                           merged_range.Row <= found_row <= (merged_range.Row + merged_range.Height - 1):
                            sheet.api.Range(merged_range.Address).UnMerge()
                            self.logger.info(f"Desmergido o intervalo: {merged_range.Address}")
                            break
            except Exception as e:
                self.logger.warning(f"Erro ao verificar/desmerger células: {str(e)}")
            
            # Inserir as colunas (duas vezes)
            sheet.api.Columns(found_col).Insert()
            sheet.api.Columns(found_col).Insert()
            self.logger.info("Duas colunas inseridas com sucesso")
            
            # Determinar colunas para copiar
            next_col = found_col + 2  # Pular as duas colunas inseridas
            
            inserted_col1_letter = self._get_column_letter(found_col)
            inserted_col2_letter = self._get_column_letter(found_col + 1)
            source_col1_letter = self._get_column_letter(next_col)
            source_col2_letter = self._get_column_letter(next_col + 1)
            
            # Copiar dados para as novas colunas - 1ª coluna
            source_range1 = f"{source_col1_letter}1:{source_col1_letter}90"
            dest_range1 = f"{inserted_col1_letter}1"
            
            self.logger.info(f"Copiando dados de {source_range1} para {dest_range1}")
            try:
                sheet.range(source_range1).copy()
                sheet.range(dest_range1).paste(paste="values_and_number_formats")
                self.logger.info("Cópia da primeira coluna concluída")
            except Exception as e:
                self.logger.error(f"Erro ao copiar valores via clipboard: {str(e)}")
                # Alternativa: tentar copiar célula por célula
                try:
                    # Tentar copiar valores e formatos diretamente
                    data_to_copy = sheet.range(source_range1).options(ndim=2).value
                    formats_to_copy = [c.number_format for c in sheet.range(source_range1)]
                    
                    # Aplicar valores célula por célula
                    for i, value in enumerate(data_to_copy):
                        if value is not None:  # Ignorar células vazias
                            cell = sheet.range(f"{inserted_col1_letter}{i+1}")
                            cell.value = value
                            try:
                                cell.number_format = formats_to_copy[i]
                            except:
                                pass
                    
                    self.logger.info("Cópia de valores da primeira coluna concluída")
                except Exception as e2:
                    self.logger.error(f"Erro ao copiar valores célula por célula: {str(e2)}")
            
            # Copiar dados para as novas colunas - 2ª coluna
            source_range2 = f"{source_col2_letter}1:{source_col2_letter}90"
            dest_range2 = f"{inserted_col2_letter}1"
            
            self.logger.info(f"Copiando dados de {source_range2} para {dest_range2}")
            try:
                sheet.range(source_range2).copy()
                sheet.range(dest_range2).paste(paste="values_and_number_formats")
                self.logger.info("Cópia da segunda coluna concluída")
            except Exception as e:
                self.logger.error(f"Erro ao copiar valores via clipboard: {str(e)}")
                # Alternativa: tentar copiar célula por célula
                try:
                    # Mesma estratégia para a segunda coluna
                    data_to_copy = sheet.range(source_range2).options(ndim=2).value
                    formats_to_copy = [c.number_format for c in sheet.range(source_range2)]
                    
                    for i, value in enumerate(data_to_copy):
                        if value is not None:
                            cell = sheet.range(f"{inserted_col2_letter}{i+1}")
                            cell.value = value
                            try:
                                cell.number_format = formats_to_copy[i]
                            except:
                                pass
                    
                    self.logger.info("Cópia de valores da segunda coluna concluída")
                except Exception as e2:
                    self.logger.error(f"Erro ao copiar valores célula por célula: {str(e2)}")
            
            self.logger.info(f"Processamento de {sheet.name} concluído com sucesso!")
        except Exception as e:
            self.logger.error(f"Erro ao processar R2_Análise: {str(e)}")
    
    def _get_column_letter(self, col_idx):
        """Converte índice de coluna para letra."""
        if col_idx <= 26:
            return chr(64 + col_idx)
        else:
            prefix = chr(64 + (col_idx - 1) // 26)
            suffix = chr(64 + (col_idx - 1) % 26 + 1)
            return prefix + suffix


class PIRAProcessor:
    """
    Classe principal para processamento de arquivos PIRA.
    """
    
    def __init__(self, client_type=None):
        """
        Inicializa o processador de PIRA.
        
        Args:
            client_type (str, opcional): Tipo de cliente. Se None, será detectado automaticamente.
        """
        self.client_type = client_type
        self.logger = logging.getLogger("PIRAAgent.PIRAProcessor")
        self.rules_engine = RulesEngine()
        self.structure_detector = StructureDetector()
        
    def process(self, file_path):
        """
        Processa um arquivo PIRA.
        
        Args:
            file_path (str): Caminho para o arquivo PIRA
            
        Returns:
            bool: True se o processamento foi bem-sucedido, False caso contrário
        """
        self.logger.info(f"Iniciando processamento do arquivo: {file_path}")
        
        # Verificar se o arquivo existe
        if not os.path.exists(file_path):
            self.logger.error(f"Arquivo não encontrado: {file_path}")
            return False
        
        # Detectar cliente se não especificado
        if not self.client_type:
            self.client_type = self.structure_detector.detect_client(file_path)
            self.logger.info(f"Cliente detectado: {self.client_type}")
        
        # Carregar regras específicas do cliente
        client_rules = self.rules_engine.load_client_rules(self.client_type)
        
        if not client_rules:
            self.logger.error(f"Não foi possível carregar regras para o cliente: {self.client_type}")
            return False
        
        try:
            # Iniciar Excel
            self.logger.info("Iniciando Excel...")
            app = xw.App(visible=False)
            
            try:
                # Abrir o PIRA
                wb = app.books.open(file_path)
                self.logger.info("PIRA aberto com sucesso")
                
                # Executar regras
                result = self.rules_engine.execute_rules(wb, client_rules)
                
                # Salvar alterações
                if result:
                    self.logger.info("Salvando alterações...")
                    wb.save()
                    self.logger.info("PIRA processado com sucesso!")
                    return True
                else:
                    self.logger.error("Falha ao executar regras. PIRA não foi modificado.")
                    return False
                
            finally:
                # Fechar Excel
                if 'wb' in locals():
                    wb.close()
                app.quit()
                self.logger.info("Excel fechado")
                
        except Exception as e:
            self.logger.error(f"Erro ao processar PIRA: {str(e)}")
            return False


def configure_logger():
    """Configura o logger para o Agente de IA de PIRAs."""
    log_file = f"pira_agent_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger("PIRAAgent")
