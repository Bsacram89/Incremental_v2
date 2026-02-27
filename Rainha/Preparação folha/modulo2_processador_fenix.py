"""
MÓDULO 2: PROCESSADOR FENIX
Sistema de Automação da Folha de Pagamento - Rainha

Este módulo replica a lógica do código M "Fenix.txt" (165 linhas)
Responsável por processar os dados da empresa Fenix
"""

import pandas as pd
import numpy as np
import re
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import json

class ProcessadorFenix:
    """
    Classe responsável por processar dados da empresa Fenix
    Replica a lógica do arquivo Fenix.txt (Power Query M)
    """
    
    def __init__(self, arquivo_fenix: Path, config: Dict = None):
        """
        Inicializa o processador Fenix
        
        Args:
            arquivo_fenix: Caminho para o arquivo Excel da Fenix
            config: Configurações e mapeamentos
        """
        self.arquivo_fenix = arquivo_fenix
        self.config = config or self.carregar_config_padrao()
        self.setup_logging()
        
        # Dados processados
        self.dados_brutos = None
        self.dados_estruturados = None
        self.funcionarios = {}
        
    def setup_logging(self):
        """Configura logging específico para Fenix"""
        self.logger = logging.getLogger('ProcessadorFenix')
        
    def carregar_config_padrao(self) -> Dict:
        """Carrega configurações padrão baseadas no código M"""
        return {
            "substituicoes_cpf": {
                "12728617769": "000160",
                "10897706606": "000161",
                "12666986766": "000170"
            },
            "codigos_salario": {
                "7": "Salario Total", "28": "Salario Total", "48": "Salario Total",
                "76": "Salario Total", "79": "Salario Total", "94": "Salario Total",
                "116": "Salario Total", "145": "Salario Total", "148": "Salario Total",
                "168": "Salario Total", "183": "Salario Total", "202": "Salario Total",
                "232": "Salario Total", "251": "Salario Total", "268": "Salario Total",
                "283": "Salario Total", "328": "Salario Total", "349": "Salario Total",
                "361": "Salario Total", "186": "Salario Total", "223": "Salario Total"
            },
            "funcionarios_excluidos": [
                "000001", "000002", "000008", "000009", "000013", "000066",
                "000132", "000135", "000138", "000142", "000155", "000158", 
                "000161", "000170"
            ],
            "empresa_padrao": "GENESIS COML CAMA MESA E BANHO LTDA",
            "categorias_pagamento": [
                "1/3 de Férias (Rescisão)", "1/3 Férias", "Adiantamento", 
                "Adiantamento Salarial", "Férias", "INSS", "INSS Rescisão",
                "INSS 13o. Rescisão", "INSS Folha", "INSS Férias", "IRRF Folha",
                "IRRF Férias", "Plano Odontologico + Dependentes", "Quebra de Caixa",
                "Quebra de Caixa 5%", "Trienio 5%", "Vale transporte", "Vale Transporte"
            ]
        }    
    def carregar_dados_brutos(self) -> pd.DataFrame:
        """
        Carrega dados brutos do arquivo Excel
        Equivale à leitura da sheet "Report"
        """
        self.logger.info(f"Carregando dados da Fenix: {self.arquivo_fenix.name}")
        
        try:
            # Ler a sheet Report
            df = pd.read_excel(self.arquivo_fenix, sheet_name="Report", header=None)
            
            # Adicionar índice como no código M
            df.reset_index(inplace=True)
            df.rename(columns={'index': 'Índice'}, inplace=True)
            
            # Aplicar substituições de CPF por código
            for cpf, codigo in self.config["substituicoes_cpf"].items():
                df = df.replace(cpf, codigo)
            
            self.dados_brutos = df
            self.logger.info(f"Dados carregados: {len(df)} linhas, {len(df.columns)} colunas")
            
            return df
            
        except Exception as e:
            self.logger.error(f"Erro ao carregar dados da Fenix: {e}")
            raise
    
    def processar_estrutura_dados(self) -> Dict:
        """
        Processa a estrutura complexa dos dados
        Replica a lógica de transposição e agrupamento do código M
        """
        self.logger.info("Processando estrutura dos dados Fenix...")
        
        if self.dados_brutos is None:
            self.carregar_dados_brutos()
        
        df = self.dados_brutos.copy()
        
        # 1. Criar coluna de linhas (removendo nulos)
        df['Linhas'] = df.apply(self._criar_lista_nao_nula, axis=1)
        
        # 2. Processar seções baseado em padrões (equivale ao código M complexo)
        dados_processados = self._processar_secoes_dados(df)
        
        # 3. Identificar e classificar funcionários
        funcionarios_data = self._identificar_funcionarios(dados_processados)
        
        self.funcionarios = funcionarios_data
        self.logger.info(f"Identificados {len(funcionarios_data)} funcionários")
        
        return funcionarios_data    
    def _criar_lista_nao_nula(self, row) -> List:
        """
        Cria lista removendo valores nulos
        Equivale à lógica List.RemoveNulls do código M
        """
        valores = []
        for col in row.index:
            if col != 'Índice' and pd.notna(row[col]) and row[col] != '':
                valores.append(str(row[col]))
        return valores
    
    def _processar_secoes_dados(self, df: pd.DataFrame) -> List[Dict]:
        """
        Processa seções de dados identificando padrões
        Replica a lógica complexa de grouping do código M
        """
        dados_processados = []
        
        for idx, row in df.iterrows():
            if not row['Linhas']:  # Pular linhas vazias
                continue
                
            # Identificar tipo de seção baseado no primeiro item
            primeiro_item = row['Linhas'][0] if row['Linhas'] else ""
            
            secao = {
                'indice': row['Índice'],
                'dados_originais': row['Linhas'],
                'tipo_secao': self._identificar_tipo_secao(primeiro_item),
                'dados_processados': self._extrair_dados_secao(row['Linhas'])
            }
            
            dados_processados.append(secao)
        
        return dados_processados    
    def _identificar_tipo_secao(self, primeiro_item: str) -> str:
        """
        Identifica o tipo de seção baseado em padrões
        Equivale aos if/else do código M
        """
        if re.match(r'^000\d+', primeiro_item):
            return 'funcionario'
        elif primeiro_item == "Função :":
            return 'funcao'
        elif primeiro_item == "Empresa :":
            return 'empresa'
        elif primeiro_item == "Admissão :":
            return 'admissao'
        elif primeiro_item in self.config["categorias_pagamento"]:
            return 'pagamento'
        elif primeiro_item == "Resumo da Folha":
            return 'resumo'
        elif primeiro_item == "Resumo do Líquido":
            return 'resumo_liquido'
        else:
            return 'dados'
    
    def _extrair_dados_secao(self, dados_linha: List) -> Dict:
        """
        Extrai dados estruturados de uma seção
        """
        if not dados_linha:
            return {}
        
        # Estrutura baseada no padrão identificado
        resultado = {
            'valores': dados_linha,
            'principal': dados_linha[0] if dados_linha else None,
            'secundario': dados_linha[1] if len(dados_linha) > 1 else None,
            'terciario': dados_linha[2] if len(dados_linha) > 2 else None
        }
        
        return resultado    
    def _identificar_funcionarios(self, dados_processados: List[Dict]) -> Dict:
        """
        Identifica e agrupa dados por funcionário
        Replica a lógica de agrupamento por Index do código M
        """
        funcionarios = {}
        funcionario_atual = None
        
        for secao in dados_processados:
            if secao['tipo_secao'] == 'funcionario':
                # Novo funcionário identificado
                codigo_funcionario = secao['dados_processados']['principal']
                
                # Verificar se deve ser excluído
                if codigo_funcionario in self.config["funcionarios_excluidos"]:
                    funcionario_atual = None
                    continue
                
                funcionario_atual = codigo_funcionario
                funcionarios[funcionario_atual] = {
                    'codigo': codigo_funcionario,
                    'nome': secao['dados_processados']['secundario'] or '',
                    'funcao': '',
                    'empresa': self.config["empresa_padrao"],
                    'admissao': '',
                    'pagamentos': [],
                    'salario_total': 0,
                    'dados_brutos': []
                }
            
            elif funcionario_atual and funcionario_atual in funcionarios:
                # Adicionar dados ao funcionário atual
                self._processar_dados_funcionario(funcionarios[funcionario_atual], secao)
        
        return funcionarios    
    def _processar_dados_funcionario(self, funcionario: Dict, secao: Dict):
        """
        Processa dados específicos de um funcionário
        """
        tipo_secao = secao['tipo_secao']
        dados = secao['dados_processados']
        
        if tipo_secao == 'funcao':
            funcionario['funcao'] = dados['secundario'] or ''
            
        elif tipo_secao == 'empresa':
            funcionario['empresa'] = dados['secundario'] or funcionario['empresa']
            
        elif tipo_secao == 'admissao':
            funcionario['admissao'] = dados['secundario'] or ''
            
        elif tipo_secao == 'pagamento':
            pagamento = {
                'tipo': dados['principal'],
                'valor': self._extrair_valor_numerico(dados['secundario'])
            }
            funcionario['pagamentos'].append(pagamento)
            
        elif tipo_secao == 'dados':
            # Verificar se é código de salário
            if dados['principal'] in self.config["codigos_salario"]:
                funcionario['salario_total'] = self._extrair_valor_numerico(dados['secundario'])
        
        # Adicionar dados brutos para auditoria
        funcionario['dados_brutos'].append(secao)
    
    def _extrair_valor_numerico(self, valor: Any) -> float:
        """
        Extrai valor numérico de uma string
        Trata formatações diversas
        """
        if pd.isna(valor) or valor == '':
            return 0.0
        
        try:
            # Converter para string e limpar
            valor_str = str(valor).strip()
            
            # Remover caracteres não numéricos exceto . , -
            valor_limpo = re.sub(r'[^\d.,-]', '', valor_str)
            
            # Tratar vírgula como separador decimal
            valor_limpo = valor_limpo.replace(',', '.')
            
            return float(valor_limpo) if valor_limpo else 0.0
            
        except (ValueError, TypeError):
            return 0.0    
    def gerar_dados_estruturados(self) -> pd.DataFrame:
        """
        Gera DataFrame estruturado final
        Equivale ao resultado final do código M Fenix
        """
        self.logger.info("Gerando dados estruturados da Fenix...")
        
        if not self.funcionarios:
            self.processar_estrutura_dados()
        
        dados_estruturados = []
        
        for codigo, funcionario in self.funcionarios.items():
            # Estrutura básica do funcionário
            registro_base = {
                'Nº': len(dados_estruturados) + 1,
                'Nome': funcionario['nome'],
                'Cargo': funcionario['funcao'],
                'Adm:': funcionario['admissao'],
                'LOJAS': funcionario['empresa'],
                'Codigo': codigo
            }
            
            # Adicionar registro de salário total
            if funcionario['salario_total'] > 0:
                registro_salario = registro_base.copy()
                registro_salario.update({
                    'Atributo': 'Salario Total',
                    'Valor': funcionario['salario_total']
                })
                dados_estruturados.append(registro_salario)
            
            # Adicionar registros de pagamentos
            for pagamento in funcionario['pagamentos']:
                registro_pagamento = registro_base.copy()
                registro_pagamento.update({
                    'Atributo': pagamento['tipo'],
                    'Valor': pagamento['valor']
                })
                dados_estruturados.append(registro_pagamento)
        
        df_estruturado = pd.DataFrame(dados_estruturados)
        
        # Aplicar transformações finais (tipos de dados)
        if not df_estruturado.empty:
            df_estruturado['Valor'] = pd.to_numeric(df_estruturado['Valor'], errors='coerce').fillna(0)
            df_estruturado['Adm:'] = pd.to_datetime(df_estruturado['Adm:'], errors='coerce')
        
        self.dados_estruturados = df_estruturado
        self.logger.info(f"Dados estruturados gerados: {len(df_estruturado)} registros")
        
        return df_estruturado    
    def gerar_relatorio_processamento(self) -> Dict:
        """
        Gera relatório do processamento Fenix
        """
        if self.dados_estruturados is None:
            self.gerar_dados_estruturados()
        
        relatorio = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'empresa': 'Fenix',
            'arquivo_origem': str(self.arquivo_fenix),
            'funcionarios_processados': len(self.funcionarios),
            'registros_gerados': len(self.dados_estruturados) if self.dados_estruturados is not None else 0,
            'total_salarios': 0,
            'total_pagamentos': 0,
            'funcionarios_detalhes': {}
        }
        
        if self.dados_estruturados is not None and not self.dados_estruturados.empty:
            # Calcular totais
            salarios = self.dados_estruturados[self.dados_estruturados['Atributo'] == 'Salario Total']
            relatorio['total_salarios'] = salarios['Valor'].sum()
            
            outros_pagamentos = self.dados_estruturados[self.dados_estruturados['Atributo'] != 'Salario Total']
            relatorio['total_pagamentos'] = outros_pagamentos['Valor'].sum()
            
            # Detalhes por funcionário
            for codigo, funcionario in self.funcionarios.items():
                relatorio['funcionarios_detalhes'][codigo] = {
                    'nome': funcionario['nome'],
                    'cargo': funcionario['funcao'],
                    'salario_total': funcionario['salario_total'],
                    'qtd_pagamentos': len(funcionario['pagamentos'])
                }
        
        return relatorio    
    def executar_processamento_completo(self) -> Tuple[pd.DataFrame, Dict]:
        """
        Executa o processamento completo da Fenix
        
        Returns:
            Tuple[DataFrame dos dados estruturados, Relatório do processamento]
        """
        self.logger.info("Iniciando processamento completo da Fenix")
        
        try:
            # 1. Carregar dados brutos
            self.carregar_dados_brutos()
            
            # 2. Processar estrutura
            self.processar_estrutura_dados()
            
            # 3. Gerar dados estruturados
            df_resultado = self.gerar_dados_estruturados()
            
            # 4. Gerar relatório
            relatorio = self.gerar_relatorio_processamento()
            
            self.logger.info("Processamento da Fenix concluído com sucesso")
            self.logger.info(f"   Funcionários: {relatorio['funcionarios_processados']}")
            self.logger.info(f"   Registros: {relatorio['registros_gerados']}")
            self.logger.info(f"   Total Salários: R$ {relatorio['total_salarios']:,.2f}")
            
            return df_resultado, relatorio
            
        except Exception as e:
            self.logger.error(f"Erro no processamento da Fenix: {e}")
            raise

# Função de teste
def main():
    """Função principal para testar o processador"""
    from pathlib import Path
    
    print("MÓDULO 2: PROCESSADOR FENIX")
    print("=" * 50)
    
    # Caminho do arquivo
    arquivo_fenix = Path(r"C:\Users\bsacr\OneDrive\Área de Trabalho\Claude Resumos\Rainha\Base de Dados\FOLHA GENESIS EXCEL 052025.xlsx")
    
    if not arquivo_fenix.exists():
        print(f"Arquivo não encontrado: {arquivo_fenix}")
        return False
    
    try:
        # Instanciar processador
        processador = ProcessadorFenix(arquivo_fenix)
        
        # Executar processamento
        df_resultado, relatorio = processador.executar_processamento_completo()
        
        print("\nRESULTADOS:")
        print(f"   Funcionários processados: {relatorio['funcionarios_processados']}")
        print(f"   Registros gerados: {relatorio['registros_gerados']}")
        print(f"   Total de salários: R$ {relatorio['total_salarios']:,.2f}")
        
        # Mostrar amostra dos dados
        if not df_resultado.empty:
            print("\nAMOSTRA DOS DADOS (primeiros 5 registros):")
            print(df_resultado.head().to_string(index=False))
        
        return True
        
    except Exception as e:
        print(f"Erro durante o teste: {e}")
        return False

if __name__ == "__main__":
    main()