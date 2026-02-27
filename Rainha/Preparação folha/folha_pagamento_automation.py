"""
Sistema de Automação para Folha de Pagamento - Rainha
Baseado na análise dos processos manuais identificados
"""

import pandas as pd
import os
import logging
from datetime import datetime
import json
from pathlib import Path

class FolhaPagamentoAutomation:
    def __init__(self, base_path="C:/Users/bsacr/OneDrive/Área de Trabalho/Claude Resumos/Rainha"):
        self.base_path = Path(base_path)
        self.setup_logging()
        self.load_config()
        
    def setup_logging(self):
        """Configura sistema de logs"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('folha_automation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_config(self):
        """Carrega configurações e mapeamentos"""
        self.config = {
            "arquivos_entrada": {
                "fenix": "FOLHA DE PAGAMENTO 052025 EXCEL fenix.xlsx",
                "genesis": "FOLHA GENESIS EXCEL 052025.xlsx",
                "extrato": "Extrato Mensal.xlsx",
                "alocacoes": "Alocações 052025.xlsx",
                "nao_contabil": "Folha não contábil.xlsx",
                "gratificacao": "Gratificação.xlsx"
            },
            "mapeamento_funcionarios": {
                # Adicionar mapeamentos CPF -> Código
                "11111111111": "000160",
                "22222222222": "000161",
                "33333333333": "000170"
                # ... adicionar mais conforme necessário
            },
            "colunas_padrao": [
                "Código", "Nome", "CPF", "Empresa", "Cargo", 
                "Salário Base", "Total Líquido", "Data Admissão"
            ]
        }
    
    def validar_estrutura_arquivos(self):
        """Valida se todos os arquivos necessários existem"""
        self.logger.info("Validando estrutura de arquivos...")
        arquivos_faltantes = []
        
        for nome, arquivo in self.config["arquivos_entrada"].items():
            caminho = self.base_path / arquivo
            if not caminho.exists():
                arquivos_faltantes.append(arquivo)
                
        if arquivos_faltantes:
            self.logger.error(f"Arquivos faltantes: {arquivos_faltantes}")
            return False
        
        self.logger.info("✅ Todos os arquivos encontrados")
        return True
    
    def carregar_arquivo_fenix(self):
        """Processa arquivo da Fenix"""
        self.logger.info("Processando arquivo Fenix...")
        try:
            arquivo = self.base_path / self.config["arquivos_entrada"]["fenix"]
            df = pd.read_excel(arquivo)
            
            # Aplicar transformações baseadas no código M
            df_processado = self.aplicar_transformacoes_fenix(df)
            
            self.logger.info(f"✅ Fenix processado: {len(df_processado)} registros")
            return df_processado
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao processar Fenix: {e}")
            return None
    
    def aplicar_transformacoes_fenix(self, df):
        """Aplica transformações específicas da Fenix"""
        # Substituir CPFs por códigos de funcionários
        if 'CPF' in df.columns:
            df['Código'] = df['CPF'].map(self.config["mapeamento_funcionarios"]).fillna(df['CPF'])
        
        # Adicionar empresa
        df['Empresa'] = 'Fenix'
        
        # Limpeza de dados
        df = df.dropna(subset=['Nome'])
        
        return df
    
    def carregar_arquivo_genesis(self):
        """Processa arquivo da Genesis"""
        self.logger.info("Processando arquivo Genesis...")
        try:
            arquivo = self.base_path / self.config["arquivos_entrada"]["genesis"]
            df = pd.read_excel(arquivo)
            
            df_processado = self.aplicar_transformacoes_genesis(df)
            
            self.logger.info(f"✅ Genesis processado: {len(df_processado)} registros")
            return df_processado
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao processar Genesis: {e}")
            return None
    
    def aplicar_transformacoes_genesis(self, df):
        """Aplica transformações específicas da Genesis"""
        # Substituir CPFs por códigos
        if 'CPF' in df.columns:
            df['Código'] = df['CPF'].map(self.config["mapeamento_funcionarios"]).fillna(df['CPF'])
        
        df['Empresa'] = 'Genesis'
        df = df.dropna(subset=['Nome'])
        
        return df
    
    def consolidar_dados(self, df_fenix, df_genesis, df_extrato=None):
        """Consolida todos os dados em uma base única"""
        self.logger.info("Consolidando dados...")
        
        dataframes = [df for df in [df_fenix, df_genesis, df_extrato] if df is not None]
        
        if not dataframes:
            self.logger.error("❌ Nenhum dataframe para consolidar")
            return None
        
        # Unir todos os dataframes
        df_consolidado = pd.concat(dataframes, ignore_index=True)
        
        # Agrupar por funcionário
        df_agrupado = self.agrupar_por_funcionario(df_consolidado)
        
        self.logger.info(f"✅ Dados consolidados: {len(df_agrupado)} funcionários")
        return df_agrupado
    
    def agrupar_por_funcionario(self, df):
        """Agrupa dados por funcionário"""
        if 'Código' not in df.columns:
            self.logger.error("❌ Coluna 'Código' não encontrada")
            return df
        
        # Agrupar valores financeiros
        colunas_soma = ['Salário Base', 'Total Líquido', 'Descontos']
        colunas_soma = [col for col in colunas_soma if col in df.columns]
        
        if colunas_soma:
            df_agrupado = df.groupby('Código').agg({
                **{col: 'sum' for col in colunas_soma},
                'Nome': 'first',
                'Empresa': 'first',
                'Cargo': 'first'
            }).reset_index()
        else:
            df_agrupado = df.drop_duplicates(subset=['Código'])
        
        return df_agrupado
    
    def gerar_relatorio_validacao(self, df):
        """Gera relatório de validação dos dados"""
        self.logger.info("Gerando relatório de validação...")
        
        relatorio = {
            "timestamp": datetime.now().isoformat(),
            "total_funcionarios": len(df),
            "empresas": df['Empresa'].value_counts().to_dict() if 'Empresa' in df.columns else {},
            "funcionarios_sem_codigo": len(df[df['Código'].isna()]) if 'Código' in df.columns else 0,
            "total_folha": df['Total Líquido'].sum() if 'Total Líquido' in df.columns else 0
        }
        
        # Salvar relatório
        with open('relatorio_validacao.json', 'w') as f:
            json.dump(relatorio, f, indent=2, ensure_ascii=False)
        
        self.logger.info("✅ Relatório de validação salvo")
        return relatorio
    
    def exportar_resultado(self, df, nome_arquivo=None):
        """Exporta resultado final"""
        if nome_arquivo is None:
            data_atual = datetime.now().strftime("%m.%y")
            nome_arquivo = f"FolhaRainha.{data_atual}.xlsx"
        
        self.logger.info(f"Exportando para {nome_arquivo}...")
        
        try:
            with pd.ExcelWriter(nome_arquivo, engine='openpyxl') as writer:
                # Aba principal
                df.to_excel(writer, sheet_name='Consolidado', index=False)
                
                # Abas por empresa
                if 'Empresa' in df.columns:
                    for empresa in df['Empresa'].unique():
                        df_empresa = df[df['Empresa'] == empresa]
                        df_empresa.to_excel(writer, sheet_name=empresa, index=False)
            
            self.logger.info(f"✅ Arquivo exportado: {nome_arquivo}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao exportar: {e}")
            return False
    
    def executar_processo_completo(self):
        """Executa o processo completo de automação"""
        self.logger.info("🚀 Iniciando processo de automação da folha de pagamento")
        
        # 1. Validar arquivos
        if not self.validar_estrutura_arquivos():
            return False
        
        # 2. Carregar dados
        df_fenix = self.carregar_arquivo_fenix()
        df_genesis = self.carregar_arquivo_genesis()
        
        # 3. Consolidar
        df_consolidado = self.consolidar_dados(df_fenix, df_genesis)
        
        if df_consolidado is None:
            self.logger.error("❌ Falha na consolidação")
            return False
        
        # 4. Validar
        relatorio = self.gerar_relatorio_validacao(df_consolidado)
        
        # 5. Exportar
        sucesso = self.exportar_resultado(df_consolidado)
        
        if sucesso:
            self.logger.info("🎉 Processo concluído com sucesso!")
            print(f"\n📊 RESUMO:")
            print(f"   Total de funcionários: {relatorio['total_funcionarios']}")
            print(f"   Empresas: {list(relatorio['empresas'].keys())}")
            print(f"   Total da folha: R$ {relatorio['total_folha']:,.2f}")
        
        return sucesso

# Exemplo de uso
if __name__ == "__main__":
    # Instanciar o sistema
    sistema = FolhaPagamentoAutomation()
    
    # Executar processo completo
    sistema.executar_processo_completo()
    
    # Para executar apenas uma parte:
    # df_fenix = sistema.carregar_arquivo_fenix()
    # df_genesis = sistema.carregar_arquivo_genesis()
    # df_final = sistema.consolidar_dados(df_fenix, df_genesis)
